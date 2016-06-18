var db = require('../model/config-db');
var ObjectId = db.Schema.Types.ObjectId;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var messageSchema = new Schema({
    userid:{
       type: ObjectId,
        ref: 'User'
    },
    images:String,
    content:String,
    roomname:Number,
});
messageSchema.plugin(autoIncrement.plugin, 'Message');
var Message = db.model('Message', messageSchema);
module.exports = Message;