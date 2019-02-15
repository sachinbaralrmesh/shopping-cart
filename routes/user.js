var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var mongoose = require('mongoose');
var crypto = require('crypto');
var Product = require('../models/product');
var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');
var Token = require('../models/token');

var nodemailer = require('nodemailer');
var sgMail = require('@sendgrid/mail');
var Nodemail = require('../models/nodemail');
var async = require('async');
var csurfProtection = csrf();

router.use(csurfProtection);
router.get('/profile', isLoggedIn, function(req, res, next) {
    /* console.log(req.user); */
    Order.find({ user: req.user }, function(err, orders) {
        if (err) {
            return res.write('error');
        }
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile', { orders: orders, user: req.user });
    });
    /*  res.render('user/profile'); */
});

router.get('/logout', isLoggedIn, function(req, res, next) {
    req.logout();
    res.redirect('/');
});

router.get('/forgot', function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/forgot', { csrfToken: req.csrfToken() });
});

router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/user/forgot');
                }

                user.passwordResetToken = token;
                user.passwordResetExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var mailOptions = {
                email_to: user.email,
                subject: 'Account Verification',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            var nm = new Nodemail();
            nm.mailsend(mailOptions, function(res) {
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/user/signin');
    });
});

router.get('/reset/:id', function(req, res) {
    User.findOne({ passwordResetToken: req.params.id, passwordResetExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/user/forgot');
        }
        res.render('user/reset', {
            user: req.user,
            csrfToken: req.csrfToken(),
            token: req.params.id
        });
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({ passwordResetToken: req.params.token, passwordResetExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }

                user.password = user.encryptPassword(req.body.password);
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;

                user.save(function(err) {
                    req.logIn(user, function(err) {
                        done(err, user);
                    });
                });
            });
        },
        function(user, done) {
            var mailOptions = {
                email_to: user.email,
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            var nm = new Nodemail();
            nm.mailsend(mailOptions, function(res) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/user/signin');
    });
});

router.use('/', isNotLoggedIn, function(req, res, next) {
    next();
});



router.get('/signup', function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signup', passport.authenticate('local-signup', {
    failureRedirect: '/user/signin',
    failureFlash: false
}), function(req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);

    } else {
        res.redirect('/user/signin');
    }
});

router.get('/signin', function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/signin', { csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0 });
});

router.post('/signin', passport.authenticate('local-signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});

router.get('/confirmation/:id', function(req, res, next) {
    var messages = req.flash('error');
    var reqtoken = req.params.id;
    if (!reqtoken) {
        req.flash('error', "No Token please verify user mail!!!");
        res.redirect('user/resend');
    }
    Token.findOne({ token: reqtoken }, function(err, doc) {

        if (err) {
            req.flash('error', err);
            res.redirect('/user/resend');
        }
        if (!doc) {
            req.flash('error', 'Invalid Token!!!');
            return res.redirect('/user/resend');
        }
        var userid = mongoose.Types.ObjectId(doc._userId).toHexString();
        User.findById(userid, function(err, user) {
            if (!user) {
                req.flash('error', 'We were unable to find a user.!!!');
                return res.redirect('/user/signup');

            }
            if (user.isVerified != null && user.isVerified == true) {
                req.flash('error', 'This user has already been verified.!!!');
                return res.redirect('/user/signin');
            }

            user.isVerified = true;
            user.save(function(err) {
                if (err) {
                    // req.flash('error', 'Something went wrong please re-click the confirmation in ur email .!!!');
                    return res.redirect('/user/signin');
                }
                if (req.session.oldUrl) {
                    var oldUrl = req.session.oldUrl;
                    req.session.oldUrl = null;
                    res.redirect(oldUrl);
                }
                req.flash('success', "Email verified successfully!!");
                return res.redirect('/user/signin');

            });
        });
    });


});

router.get('/resend', function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/resend', { csrfToken: null, messages: messages, hasErrors: messages.length > 0 });
});

router.post('/resend', passport.authenticate('local-resendtoken', {
    failureRedirect: '/user/resend',
    failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/signin');
    }
});
/* router.post('/confirmation', userController.confirmationPost);
router.post('/resend', userController.resendTokenPost);
 */

router.get('/resetpassword/:token', passport.authenticate('local-resetpasswordconfirmation', {
    failureRedirect: '/user/changepassword',
    failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);

    } else {
        res.redirect('/user/signin');
    }
});
module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function isNotLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}