var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
    email : { type : String, required : true},
    password : { type : String, required : true},
    phonenumber :{ type : Number, required : false },
    address :{type: String, required : false},
    pincode :{type: String, required : false},
    country: {type: String, required : false},
    city: {type: String, required : false},
    roles: [{ type: 'String' }],
    isVerified: { type: Boolean, default: false },
    passwordResetToken: String,
    passwordResetExpires: Date
});

userSchema.methods.encryptPassword = function(password){

    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
};


module.exports=mongoose.model("User",userSchema);   