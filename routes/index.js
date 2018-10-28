var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Images = require('../models/images');
var Product= require('../models/product');

 /* GET home page. */
router.get('/', function(req, res, next) {
  
    Product.find(function(err, docs){
      var productChunks=[];
      var treshold=3;
      // for (var i=0; i<docs.length; i += treshold){
      //   productChunks.push(docs.slice(i, i+ treshold));
      // }
      for (var i=0; i<treshold; i++){
        productChunks.push(docs.slice(i, i+3));
      }
    res.render('shop/index', { title: 'Shopping Cart',products : productChunks });
    
  });

});

router.get('/add-to-cart/:id',function (req, res, next){

    var productId= req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart: { items: {}} );

    Product.findById(productId, function(err, product){
        if(err){

          return res.redirect('/');
        }

        cart.add(product,product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        if(!req.session.cart)
        {
          return res.render('shop/shopping-cart',{products: null});
        }
        var cart1= new Cart(req.session.cart);
        return res.render('shop/shopping-cart',{products: cart1.genrateArray(), totalPrices: cart1.totalPrice});
        // res.redirect('/');

    });
});

router.get('/shopping-cart',function(req,res,next){
  if(!req.session.cart)
  {
    return res.render('shop/shopping-cart',{products: null});
  }
  var cart= new Cart(req.session.cart);
  return res.render('shop/shopping-cart',{products: cart.genrateArray(), totalPrices: cart.totalPrice});
});

router.get('/search', function(req, res, next) {
  console.log(req.query.search);
  var value='/'+req.query.search+'/i';
  console.log(value);
  Product.find({"title":{$regex: '.*'+req.query.search+'.*'}},function(err, docs){
    var productChunks=[];
    var treshold=3;
    // for (var i=0; i<docs.length; i += treshold){
    //   productChunks.push(docs.slice(i, i+ treshold));
    // }
    console.log(docs);
    for (var i=0; i<docs.length; i++){
      productChunks.push(docs.slice(1,4));
    }
    console.log(productChunks);
  res.render('shop/search-result', { products : productChunks });
  
});

});

router.get('/checkout', function(req, res, next){
if(!req.session.cart){
  return res.redirect('/shopping-cart');
}
var cart = new Cart(req.session.cart);
res.render('shop/checkout', {total:  cart.totalPrice});
});
//search-result


router.get('/productview/:id',function (req, res, next){

  var productId= req.params.id;
  var images;
  Images.find({"productId":productId},function(err, docs){
  images=docs;
  })
  Product.findById(productId, function(err, product){
      if(err){

        return res.render('/');
      }
      res.render('shop/product-view', { images: images,products: product });

  });
});
module.exports = router;
