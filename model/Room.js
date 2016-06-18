var db = require('../model/config-db');
var ObjectId = db.Schema.Types.ObjectId;
var Room = db.model('Room', {
    name:{
        type:Number,
        default:1
    },
    status:String,
    useridnam:{
       type: ObjectId,
        ref: 'User'
    },
    useridnu:{
       type: ObjectId,
        ref: 'User'
    },
    havenu:{
        type:Boolean,
        default:false,
    },
    havenam:{
        type:Boolean,
        default:true,
    },
    create:Date,
});
module.exports = Room;