var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Images = require('../models/images');
var Product = require('../models/product');

var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
    var successMsg = req.flash('success')[0];
    Product.find(function(err, docs) {
        var productChunks = [],
            new_product = [];
        var treshold = 3;
        // for (var i=0; i<docs.length; i += treshold){
        //   productChunks.push(docs.slice(i, i+ treshold));
        // }
        for (var i = 0; i < treshold; i++) {
            productChunks.push(docs.slice(i, i + 3));
        }
        docs.forEach(function(element) {
            new_product.push(element);
        });


        res.render('shop/index', { title: 'Shopping Cart', products: productChunks, new_products: new_product, successMsg: successMsg, noMessages: !successMsg });

    });

});

router.get('/add-to-cart/:id', function(req, res, next) {

    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : { items: {} });
    Product.findById(productId, function(err, product) {
        if (err) {

            return res.redirect('/');
        }

        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        if (!req.session.cart) {
            return res.render('shop/shopping-cart', { products: null });
        }
        var cart1 = new Cart(req.session.cart);
        return res.render('shop/shopping-cart', { products: cart1.generateArray(), totalPrices: cart1.totalPrice });
        // res.redirect('/');

    });
});

router.get('/reduce/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : { items: {} });
    console.log(cart);
    cart.reduceByOne(productId);
    console.log(cart);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});
router.get('/removeall/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : { items: {} });
    cart.removeAll(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', { products: null });
    }
    var cart = new Cart(req.session.cart);
    return res.render('shop/shopping-cart', { products: cart.generateArray(), totalPrices: cart.totalPrice });
});

router.get('/search', function(req, res, next) {
    console.log(req.query.search);
    var value = '/' + req.query.search + '/i';
    console.log(value);
    Product.find({ "title": { $regex: '.*' + req.query.search + '.*' } }, function(err, docs) {
        var productChunks = [];
        var treshold = 3;
        // for (var i=0; i<docs.length; i += treshold){
        //   productChunks.push(docs.slice(i, i+ treshold));
        // }
        console.log(docs);
        for (var i = 0; i < docs.length; i++) {
            productChunks.push(docs.slice(1, 4));
        }
        console.log(productChunks);
        res.render('shop/search-result', { products: productChunks });

    });

});

router.get('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error');
    res.render('shop/checkout', { totalPrices: cart.totalPrice, errMsg: errMsg, noErrors: !errMsg });
});

router.post('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.render('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    const token = req.body.stripeToken;
    var stripe = require("stripe")("sk_test_4dS4qP3xqDrbShF9a9x3kOO5");
    stripe.charges.create({
        amount: cart.totalPrice * 100,
        currency: 'usd',
        description: 'test charge by carpet',
        source: req.body.stripeToken,
    }, function(err, charge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id

        });
        order.save(function(err, result) {
            req.flash('success', 'Successfully bought product');
            req.session.cart = null;
            res.redirect('/');
        });

    });
});

//search-result

router.get('/productview/:id', function(req, res, next) {

    var productId = req.params.id;
    var images;
    Images.find({ "productId": productId }, function(err, docs) {
        images = docs;
    });
    Product.findById(productId, function(err, product) {
        if (err) {

            return res.render('/');
        }
        res.render('shop/product-view', { images: images, products: product });

    });
});

//shopping orders
router.get('/orders', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/orders', { products: null });
    }
    var order = new Cart(req.session.cart);
    return res.render('shop/orders', { products: order.generateArray(), totalPrices: cart.totalPrice });
});


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}