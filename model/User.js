var db = require('../model/config-db');
var User = db.model('User', {
	username:String,
    email:String,
	password:String,
	avartar:String,
    idFace: String,
    name: String,
    configuser:String,
    config:{
      type:Boolean,
      default:false
    },
    tuoi:{
        type:Number,
        default:0
    },
    images:String,
    sex:String,
    status:{
        type:String,
        default:'offline'
    },
    sothich:String,
    created: Date,
    updated:Date,
    role:{
    	type:String,
    	default:'member'
    }
});
module.exports = User;