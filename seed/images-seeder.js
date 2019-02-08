var Images = require('../models/images');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shopping', { useNewUrlParser: true });

var images = [
    new Images({
        productId: '5c54d70fad281e17403c645f',
        imagePath: 'http://localhost:3000/images/banner1.jpg',
    }),

    new Images({
        productId: '5c54d70fad281e17403c645f',
        imagePath: 'http://localhost:3000/images/banner2.jpg',
    }),

    new Images({
        productId: '5c54d70fad281e17403c645f',
        imagePath: 'http://localhost:3000/images/banner3.jpg',
    }),

    new Images({
        productId: '5c54d70fad281e17403c645f',
        imagePath: 'http://localhost:3000/images/banner4.jpg',
    })
];
var done = 0;
for (var i = 0; i < images.length; i++) {
    images[i].save(function(err, result) {
        done++;
        if (done === images.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}