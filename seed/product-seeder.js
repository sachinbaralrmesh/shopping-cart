var Product = require('../models/product');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shopping', {useNewUrlParser: true });

var products = [
    new Product({
    imagePath:'http://localhost:3000/images/banner1.jpg',
    images:['banner1','banner2','banner3','banner4'],
    title:'carpet1',
    description:'One of the Ardabil Carpets A small rug  A carpet is a textile floor covering typically consisting of an upper layer of pile attached to a backing. The pile was traditionally made from wool, but, since the 20th century, synthetic fibers such as polypropylene, nylon or polyester are often used, as these fibers are less expensive than wool. The pile usually consists of twisted tufts which are typically heat-treated to maintain their structure. The term "carpet" is often used interchangeably with the term "rug", although the term "carpet" can be applied to a floor covering that covers an entire house, whereas a "rug" is generally no bigger than a single room, and traditionally does not even span from one wall to another, and is typically not even attached as part of the floor.',
    price:500
}),
new Product({
    imagePath:'http://localhost:3000/images/banner2.jpg',
    images:['banner1','banner2','banner1','banner2'],
    title:'carpet2',
    description:'One of the Ardabil Carpets A small rug  A carpet is a textile floor covering typically consisting of an upper layer of pile attached to a backing. The pile was traditionally made from wool, but, since the 20th century, synthetic fibers such as polypropylene, nylon or polyester are often used, as these fibers are less expensive than wool. The pile usually consists of twisted tufts which are typically heat-treated to maintain their structure. The term "carpet" is often used interchangeably with the term "rug", although the term "carpet" can be applied to a floor covering that covers an entire house, whereas a "rug" is generally no bigger than a single room, and traditionally does not even span from one wall to another, and is typically not even attached as part of the floor.',
    price:199
}),
new Product({
    imagePath:'http://localhost:3000/images/banner3.jpg',
    images:['banner1','banner2','banner3','banner1'],
    title:'carpet3',
    description:'One of the Ardabil Carpets A small rug  A carpet is a textile floor covering typically consisting of an upper layer of pile attached to a backing. The pile was traditionally made from wool, but, since the 20th century, synthetic fibers such as polypropylene, nylon or polyester are often used, as these fibers are less expensive than wool. The pile usually consists of twisted tufts which are typically heat-treated to maintain their structure. The term "carpet" is often used interchangeably with the term "rug", although the term "carpet" can be applied to a floor covering that covers an entire house, whereas a "rug" is generally no bigger than a single room, and traditionally does not even span from one wall to another, and is typically not even attached as part of the floor.',
    price:150
}),
new Product({
    imagePath:'http://localhost:3000/images/banner3.jpg',
    title:'carpet4',
    images:['banner1','banner2','banner3','banner1'],
    description:'One of the Ardabil Carpets A small rug  A carpet is a textile floor covering typically consisting of an upper layer of pile attached to a backing. The pile was traditionally made from wool, but, since the 20th century, synthetic fibers such as polypropylene, nylon or polyester are often used, as these fibers are less expensive than wool. The pile usually consists of twisted tufts which are typically heat-treated to maintain their structure. The term "carpet" is often used interchangeably with the term "rug", although the term "carpet" can be applied to a floor covering that covers an entire house, whereas a "rug" is generally no bigger than a single room, and traditionally does not even span from one wall to another, and is typically not even attached as part of the floor.',
    price:300
}),
new Product({
    imagePath:'http://localhost:3000/images/banner1.jpg',
    images:['banner1','banner2','banner3','banner1'],
    title:'carpet5',
    description:'One of the Ardabil Carpets A small rug  A carpet is a textile floor covering typically consisting of an upper layer of pile attached to a backing. The pile was traditionally made from wool, but, since the 20th century, synthetic fibers such as polypropylene, nylon or polyester are often used, as these fibers are less expensive than wool. The pile usually consists of twisted tufts which are typically heat-treated to maintain their structure. The term "carpet" is often used interchangeably with the term "rug", although the term "carpet" can be applied to a floor covering that covers an entire house, whereas a "rug" is generally no bigger than a single room, and traditionally does not even span from one wall to another, and is typically not even attached as part of the floor.',
    price:350
}),
new Product({
    imagePath:'http://localhost:3000/images/banner2.jpg',
    images:['banner1','banner2','banner3','banner1'],
    title:'carpet6',
    description:'One of the Ardabil Carpets A small rug  A carpet is a textile floor covering typically consisting of an upper layer of pile attached to a backing. The pile was traditionally made from wool, but, since the 20th century, synthetic fibers such as polypropylene, nylon or polyester are often used, as these fibers are less expensive than wool. The pile usually consists of twisted tufts which are typically heat-treated to maintain their structure. The term "carpet" is often used interchangeably with the term "rug", although the term "carpet" can be applied to a floor covering that covers an entire house, whereas a "rug" is generally no bigger than a single room, and traditionally does not even span from one wall to another, and is typically not even attached as part of the floor.',
    price:230
}),
new Product({
    imagePath:'http://localhost:3000/images/banner3.jpg',
    images:['banner1','banner2','banner3','banner1'],
    title:'carpet7',
    description:'One of the Ardabil Carpets A small rug  A carpet is a textile floor covering typically consisting of an upper layer of pile attached to a backing. The pile was traditionally made from wool, but, since the 20th century, synthetic fibers such as polypropylene, nylon or polyester are often used, as these fibers are less expensive than wool. The pile usually consists of twisted tufts which are typically heat-treated to maintain their structure. The term "carpet" is often used interchangeably with the term "rug", although the term "carpet" can be applied to a floor covering that covers an entire house, whereas a "rug" is generally no bigger than a single room, and traditionally does not even span from one wall to another, and is typically not even attached as part of the floor.',
    price:200
}),
new Product({
    imagePath:'http://localhost:3000/images/banner4.jpg',
    images:['banner1','banner2','banner3','banner1'],
    title:'carpet8',
    description:'One of the Ardabil Carpets A small rug  A carpet is a textile floor covering typically consisting of an upper layer of pile attached to a backing. The pile was traditionally made from wool, but, since the 20th century, synthetic fibers such as polypropylene, nylon or polyester are often used, as these fibers are less expensive than wool. The pile usually consists of twisted tufts which are typically heat-treated to maintain their structure. The term "carpet" is often used interchangeably with the term "rug", although the term "carpet" can be applied to a floor covering that covers an entire house, whereas a "rug" is generally no bigger than a single room, and traditionally does not even span from one wall to another, and is typically not even attached as part of the floor.',
    price:100
})
];
var done=0;
for(var i=0; i< products.length; i++)
{
    products[i].save(function(err,result)
    {
        done++;
        if(done === products.length)
        {
            exit();
        }
    });
}

function exit()
{
    mongoose.disconnect();
}
