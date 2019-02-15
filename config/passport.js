var passport = require('passport');
var User = require('../models/user');
var Token = require('../models/token');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var sgMail = require('@sendgrid/mail');
var Nodemail = require('../models/nodemail');
var localStratergy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {

    done(null, user.id);

});

passport.deserializeUser(function(id, done) {

    User.findById(id, function(err, user) {
        done(err, user);
    });
});


passport.use('local-signup', new localStratergy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true

}, function(req, email, password, done) {

    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Email').notEmpty().isLength({ min: 4 });
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({ 'email': email }, function(err, user) {

        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, { message: "Email is already exist!!!" });
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.address = req.body.address;
        newUser.phonenumber = req.body.number;
        newUser.pincode = req.body.pincode;
        newUser.city = req.body.city;
        newUser.country = req.body.country;
        newUser.save(function(err, result) {
            if (err) {
                done(err);
            }

            User.findOne({ 'email': email }, function(err, user) {
                if (user) {
                    var tokens = new Token();
                    tokens._userId = user._id;
                    tokens.token = crypto.randomBytes(16).toString('hex');
                    // Save the verification token
                    tokens.save(function(err) {
                        if (err) { return done(null, false, { message: err.message }); }

                        // var transporter = nodemailer.createTransport({ service: 'sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
                        var mailOptions = {
                            email_to: user.email,
                            subject: 'Account Verification',
                            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/confirmation\/' + tokens.token + '.\n'
                        };
                        var nm = new Nodemail();
                        nm.mailsend(mailOptions, function(res) {
                            return done(null, newUser, { message: res });
                        });

                    });
                }
            });

        });

    });
}));

passport.use('local-signin', new localStratergy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true

}, function(req, email, password, done) {
    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid Email').notEmpty().isLength({ min: 4 });
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    User.findOne({ 'email': email }, function(err, user) {

        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: "No user found!!!" });
        }
        if (!user.validPassword(password)) {
            return done(null, false, { message: "Wrong Password!!!" });
        }
        if (!user.isVerified) {
            return done(null, false, { message: "Your account has not been verified. <a href='user/resend'>Please click this link to resend</a>" });
        }
        return done(null, user);
    });
}));

passport.use('local-resendtoken', new localStratergy({
    usernameField: 'email',
    passReqToCallback: true

}, function(req, email, password, done) {

    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({ 'email': email }, function(err, user) {

        if (!user) {
            return done(null, false, { message: "We were unable to find a user with that email." });
        }
        if (user.isVerified) return done(null, false, { message: 'This account has already been verified. Please log in.' });

        var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
        // Save the verification token
        token.save(function(err) {
            if (err) { return done(null, false, { message: err.message }); }

            // Send the email
            var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
            var mailOptions = { from: 'no-reply@aastarainternational.com', to: user.email, subject: 'Account Verification', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
            transporter.sendMail(mailOptions, function(err) {
                if (err) {
                    return done(null, false, { message: err.message });
                }
                return done(null, false, { message: 'A verification email has been sent to ' + user.email + '.' });
            });
        });
    });
}));

passport.use('local-resetpasswordtoken', new localStratergy({
    usernameField: 'email',
    passReqToCallback: true

}, function(req, email, done) {

    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, { message: messages });
    }
    User.findOne({ 'email': email }, function(err, user) {

        if (!user) {
            return done(null, false, { message: "We were unable to find a user with that email." });
        }
        if (!user.passwordResetExpires) {
            // Save the verification token
            user.passwordResetToken = crypto.randomBytes(16).toString('hex');
            user.passwordResetExpires = new Date() + 1;
            user.save(function(err) {
                if (err) { return done(null, false, { message: err.message }); }

                // Send the email
                var mailOptions = {
                    email_to: user.email,
                    subject: 'Account Verification',
                    text: 'Hello,\n\n' + 'Please verify your email to reset by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/resetpassword\/' + user.passwordResetToken + '.\n'
                };
                var nm = new Nodemail();
                nm.mailsend(mailOptions, function(res) {
                    return done(null, user, { message: res });
                });
            });
        }
        if (user.passwordResetExpires <= new Date()) {

            user.passwordResetToken = crypto.randomBytes(16).toString('hex');
            user.passwordResetExpires = new Date() + 1;
            user.updateOne({ 'email': email }, { $set: { passwordResetToken: crypto.randomBytes(16).toString('hex'), passwordResetExpires: new Date() + 1 } }, function(err, res) {
                if (err) { return done(null, false, { message: err.message }); }

                // Send the email
                var mailOptions = {
                    email_to: user.email,
                    subject: 'Account Verification',
                    text: 'Hello,\n\n' + 'Please verify your email to reset by clicking the link: \nhttp:\/\/' + req.headers.host + '\/user\/resetpassword\/' + user.passwordResetToken + '.\n'
                };
                var nm = new Nodemail();
                nm.mailsend(mailOptions, function(res) {
                    return done(null, user, { message: res });
                });
            });
        }
    });
}));


passport.use('local-resetpasswordconfirmation', new localStratergy({
    usernameField: 'email',
    tokenField: 'token',
    passReqToCallback: true

}, function(req, email, password, done) {
    req.checkBody('email', 'Invalid Email').notEmpty().isEmail();
    req.checkBody('token', 'Invalid Email').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    User.findOne({ passwordResetToken: req.body.token }, function(err, user) {

        if (err) {
            return done(err);
        }
        if (!token) {
            return done(null, false, { message: "No user found!!!" });
        }
        user.updateOne({ 'email': email }, { $set: { password: user.encryptPassword(password), passwordResetExpires: new Date() + 1 } }, function(err, res) {
            if (err) { return done(null, false, { message: err.message }); }

            if (!user) return done(null, false, { message: "We were unable to find a user." });

            done(null, false, { message: "The account password has been changed. Please log in." });
        });
    });
}));