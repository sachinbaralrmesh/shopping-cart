var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    productId : { type : Schema.Types.ObjectId, ref: 'User'},
    imagePath:[{type:String}]
});

module.exports=mongoose.model("Images",schema);   