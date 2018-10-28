var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
    user : { type : Schema.Types.ObjectId, ref: 'User'},
    cart : { type : Object, required : true},
    address: { type: String, required: true},
    name:{ type: String, required: true},
    createdDate:{type:Date, default: Date.now},
    paymentId: {type: String, required: true}
});

module.exports=mongoose.model("User",orderSchema);   