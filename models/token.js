var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const schema = new Schema({
    _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: false, default: Date.now, expires: 43200 }
});

module.exports = mongoose.model('Token', schema);