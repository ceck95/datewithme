var express = require('express');
var router = express.Router();
var passport = require('../config-passport')
var User = require('../model/User');
var Room = require('../model/Room');
var Wait = require('../model/Wait');
var ListBlock = require('../model/ListBlock');
var isAuthenticated = require('../middleware/passport');
var multer  = require('multer');
var path = require('path');
var Message = require('../model/Message');
var Q = require('q');
var fileFilter = function (req, file, cb) {
    if (path.extname(file.originalname) == '.png') {
      return cb(null, true)
    }else if(path.extname(file.originalname) == '.jpg'){
      return cb(null, true)
      
    }
    cb({message:'khong dung file dinh dang'})
  }

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
        cb(null, './public/uploads/')
    },
  filename: function (req, file, cb) {
      cb(null, 'DateWithMe-'+file.originalname)
  }
});
var upload = multer({
  storage : storage,
  fileFilter: fileFilter
}).single('file');

router.post('/photo',function(req,res){
  upload(req,res,function(err) {
    if(err) {
      console.log(err);
      return res.jsonp(err.message);
    }
    if(req.session.passport.user){
      User.findById(req.session.passport.user).exec(function(err,doc){
        doc.images = 'uploads/'+req.file.filename;
        doc.save(function(err,doc){
          res.jsonp(doc);
        })
      });
    }
  });
});
/* GET users listing. */
router.get('/checklogin',isAuthenticated,
  function(req, res){
    if(req.session.passport.user){
      User.findById(req.session.passport.user, function(err, user) {
        if(err) {
          console.log(err);
        } else {
            res.jsonp({ user: user});
        }
      });
    }else{
      res.jsonp({sate:'chua login'});
    }
  });
router.get('/logout',isAuthenticated,function(req,res){
  if(req.session.passport.user){
    req.logout();
    req.session.destroy();
    res.jsonp({logout:'success'});
  }else{
    res.jsonp({logout:'fail'});
  }
});
router.post('/signup', function(req, res, next ){
    passport.authenticate('signup', function(err, user, info) {
      if (err) { return next(err) }
      if (!user) { return res.json(info) }
      res.json(user);
    })(req, res, next);   
});
router.post('/dangnhap', function(req, res, next) {
  passport.authenticate('login', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send(info);
    }
    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.send(user);
    });      
  })(req, res, next);
});
router.post('/kickhoat',function(req,res){
  User.findOne({
    $and:[
      {username:req.body.username},
      {configuser:req.body.makh}
    ]
  },function(err,data){
    if(!data){
      res.jsonp({message:'fail config'});
    }else{
      if(data.config === true){
        res.jsonp({message:'tai khoan nay da kick hoat rui'});
      }else{
        data.config = true;
        data.save(function(err,data){
          if(err){
            res.jsonp({message:'fail config'});
          }else{
            if(req.session.passport){
              res.jsonp({message:'success',config:true,login:true});
            }else{
              res.jsonp({message:'success',config:true,login:false});
            }
          }
        });
      }
    }
  });
});
// router.post('/room',function(req,res){
//   Room.findOne({}).sort({name : -1}).limit(1).exec( function(err, doc) {
//     if(doc)
//     var name = doc.name+1;
//     else
//     var name = 1;
//     if(req.body.sex == 'nam'){
//        Room.findOne({
//           $and:[
//             {useridnam:req.body.iduser},
//           ]
//         }).exec(function(err,doc){
//           if(doc == null){
//              Room.findOne({havenam:false}).limit(1).exec(function(err,doc){
//               if(doc == null){
//                   if(name == 1){
//                     var RoomNew = new Room({
//                       useridnam:req.body.iduser,
//                       havenam:true,
//                       create:Date.now()
//                     });  
//                     RoomNew.save(function(err,doc){
//                       res.jsonp(doc);
//                     });  
//                   }else{
//                     var RoomNew = new Room({
//                       useridnam:req.body.iduser,
//                       name:name,
//                       havenam:true,
//                       create:Date.now()
//                     });  
//                     RoomNew.save(function(err,doc){
//                       res.jsonp(doc);
//                     }); 
//                   }
//                 }else{
//                   doc.useridnam = req.body.iduser;
//                   doc.havenam = true;
//                   doc.save(function(err,doc){
//                     res.jsonp(doc);
//                   });
//                 }  
//             });  
//           }else{
//             if(doc.havenu == true){
//               res.jsonp(doc);
//             }else{
//               res.jsonp({message:'join phong fail'});
//             }
//           }
//         });
//     }else if(req.body.sex == 'nu') {
//       Room.findOne({
//           $and:[
//             {useridnu:req.body.iduser},
//           ]
//         }).exec(function(err,doc){
//           if(doc == null){
//             Room.findOne({havenu:false}).limit(1).exec(function(err,doc){
//               if(doc == null){
//                   if(name == 1){
//                     var RoomNew = new Room({
//                       useridnu:req.body.iduser,
//                       havenu:true,
//                       create:Date.now()
//                     });  
//                     RoomNew.save(function(err,doc){
//                       res.jsonp(doc);
//                     });  
//                   }else{
//                     var RoomNew = new Room({
//                       useridnu:req.body.iduser,
//                       havenu:true,
//                       name:name,
//                       create:Date.now()
//                     });  
//                     RoomNew.save(function(err,doc){
//                       res.jsonp(doc);
//                     }); 
//                   }
//                 }else{
//                   doc.useridnu = req.body.iduser;
//                   doc.havenu = true;
//                   doc.save(function(err,doc){
//                     res.jsonp(doc);
//                   });
//                 }  
//             });
//           }else{
//             if(doc.havenam == true){
//               res.jsonp(doc);
//             }else{
//               res.jsonp({message:'join phong fail'});
//             }
//           }
//         });
//     }
//   });
// });
router.post('/joinwait',function(req,res){
  var id_user = req.body.user;
  var sex_user = req.body.sex;
  if(sex_user == 'nu'){
    Room.findOne({
      $and:[
        {'useridnu': id_user},
        {'havenu':true}
      ]}).exec(function(err,doc){
      if(doc){
        res.jsonp(doc);
      }else{
        Room.find({havenu:false}).exec(function(err,data){
          if(data.length == 0){
               Wait.findOne({'userid':id_user}).exec(function(err,doc){
                if(doc){
                  res.jsonp({message:'dang tham gia wait'});
                }else{
                  var NewWait = new Wait({
                    userid: id_user,
                    sex:'nu'
                  });
                  NewWait.save(function(err,doc){
                    res.jsonp(doc);
                  });
                }
              });
          }else if(data.length > 0){
              var listblockget = [];
              for(var i in data){
                listblockget.push(data[i]._id);
              }
              (function next(index) {
                if (index === data.length) { // No items left
                    Wait.findOne({userid:id_user}).exec(function(err,doc){
                      if(doc){
                        res.end('dang tham gia phong cho');
                        return;
                      }else{
                        var NewWait = new Wait({
                          userid: id_user,
                          sex:'nu'
                        });
                        NewWait.save(function(err,doc){
                          res.end('da them phong phong cho');
                          return;
                        });
                      }
                    });
                    return;
                }
                ListBlock.findOne({
                  $and:[
                    {roomid:listblockget[index]},
                    {userid:id_user}
                  ]
                }).exec(function(err,doc){
                  if(!doc){
                      Room.findById(listblockget[index]).exec(function(err,doc){
                        Wait.findOne({'userid':id_user}).exec(function(err,doc){
                          Wait.remove({'userid':id_user},function(err){
                            if (err) res.jsonp({message:'Loi xoa Wait'});
                          })
                        });
                        doc.useridnu = id_user;
                        doc.havenu = true;
                        doc.save(function(err,doc){
                          res.jsonp(doc);
                        });
                      });
                  }else{
                    next(index+1); 
                  }
                });
            })(0);
          }
        });
      }
    });
  }else if(sex_user == 'nam'){
    Room.findOne({useridnam: id_user}).exec(function(err,doc){
      if(doc){
        var id_phong_moi = doc._id;
        Room.findOne({
            $and:[
              {havenu:true},
              {useridnam:id_user}
            ]}).exec(function(err,doc){
            if(doc){
              res.jsonp(doc);
            }else{
              Wait.find({sex:'nu'}).exec(function(err,doc){
                if(doc.length > 0){
                  var listblockget_nam = [];
                  for(var i in doc){
                    listblockget_nam.push(doc[i].userid);
                  }
                  (function next(index) {
                    if (index === doc.length) { // No items left
                        Room.findById(id_phong_moi).exec(function(err,doc){
                          res.jsonp(doc);
                          return;
                        });
                    }
                    ListBlock.findOne({
                      $and:[
                        {roomid:id_phong_moi},
                        {userid:listblockget_nam[index]}
                      ]
                    }).exec(function(err,doc){
                      if(!doc){
                          Room.findById(id_phong_moi).exec(function(err,doc){
                            Wait.findOne({'userid':listblockget_nam[index]}).exec(function(err,doc){
                              if(doc){
                                Wait.remove({'userid':listblockget_nam[index]},function(err){
                                  if (err) res.jsonp({message:'Loi xoa Wait'});
                                })
                              }
                            });
                            doc.useridnu = listblockget_nam[index];
                            doc.havenu = true;
                            doc.save(function(err,doc){
                              res.send(doc);
                            });
                          });
                      }else{
                        next(index+1); 
                      }
                    });
                })(0);
                }else{
                  Room.findById(id_phong_moi).exec(function(err,doc){
                    res.jsonp(doc);
                  });
                }
              });
            }
        });
      }else{
        Room.findOne({}).sort({name : -1}).limit(1).exec( function(err, doc) {
          if(doc)
          var name = doc.name+1;
          else
          var name = 1;
          if(name == 1){
            var RoomNew = new Room({
              useridnam:id_user,
              havenam:true,
              create:Date.now()
            });  
            RoomNew.save(function(err,doc){
              var id_phong_moi = doc._id;
              Wait.find({sex:'nu'}).exec(function(err,doc){
                if(doc.length > 0){
                  var listblockget_nam = [];
                  for(var i in doc){
                    listblockget_nam.push(doc[i].userid);
                  }
                  (function next(index) {
                      if (index === doc.length) { // No items left
                          Room.findById(id_phong_moi).exec(function(err,doc){
                            res.jsonp(doc);
                            return;
                          });
                      }
                      ListBlock.findOne({
                        $and:[
                          {roomid:id_phong_moi},
                          {userid:listblockget_nam[index]}
                        ]
                      }).exec(function(err,doc){
                        if(!doc){
                            Room.findById(id_phong_moi).exec(function(err,doc){
                              Wait.findOne({'userid':listblockget_nam[index]}).exec(function(err,doc){
                                if(doc){
                                  Wait.remove({'userid':listblockget_nam[index]},function(err){
                                    if (err) res.jsonp({message:'Loi xoa Wait'});
                                  })
                                }
                              });
                              doc.useridnu = listblockget_nam[index];
                              doc.havenu = true;
                              doc.save(function(err,doc){
                                res.send(doc);
                              });
                            });
                        }else{
                          next(index+1); 
                        }
                      });
                  })(0);
                }else{
                  Room.findById(id_phong_moi).exec(function(err,doc){
                    res.jsonp(doc);
                  });
                }
              });
            });  
          }else{
            var RoomNew = new Room({
              useridnam:id_user,
              name:name,
              havenam:true,
              create:Date.now()
            });  
            RoomNew.save(function(err,doc){
              var id_phong_moi = doc._id;
              Wait.find({sex:'nu'}).exec(function(err,doc){
                if(doc.length > 0){
                  var listblockget_nam = [];
                  for(var i in doc){
                    listblockget_nam.push(doc[i].userid);
                  }
                  (function next(index) {
                    if (index === doc.length) { // No items left
                        Room.findById(id_phong_moi).exec(function(err,doc){
                          res.jsonp(doc);
                          return;
                        });
                    }
                    ListBlock.findOne({
                      $and:[
                        {roomid:id_phong_moi},
                        {userid:listblockget_nam[index]}
                      ]
                    }).exec(function(err,doc){
                      if(!doc){
                          Room.findById(id_phong_moi).exec(function(err,doc){
                            Wait.findOne({'userid':id_user}).exec(function(err,doc){
                              if(doc){
                                Wait.remove({'userid':id_user},function(err){
                                  if (err) res.jsonp({message:'Loi xoa Wait'});
                                })
                              }
                            });
                            doc.useridnu = listblockget_nam[index];
                            doc.havenu = true;
                            doc.save(function(err,doc){
                              res.jsonp(doc);
                            });
                          });
                      }else{
                        next(index+1); 
                      }
                    });
                })(0);
                }else{
                  Room.findById(id_phong_moi).exec(function(err,doc){
                    res.jsonp(doc);
                  });
                }
              });
            }); 
          }
        });
      }
    });
  } 
});
router.get('/get/user/:id',isAuthenticated,function(req,res){
  var id = req.params.id;
  User.findById(id).exec(function(err,doc){
    res.send(doc);
  });
});
router.get('/user/updatestatus',function(req,res){
  var id = req.query.id;
  var status = req.query.status;
  User.findById(id).exec(function(err,doc){
    doc.status = status;
    doc.save(function(err,doc){
      if(err) res.jsonp({message:'error update status'})
      res.jsonp(doc);
    })
  });
});
router.get('/room/updatestatus',isAuthenticated,function(req,res){
  var id = req.query.id;
  var status = req.query.status;
  Room.findById(id).exec(function(err,doc){
    doc.status = status;
    doc.save(function(err,doc){
      if(err) res.jsonp({message:'error update status'})
      res.jsonp(doc);
    })
  });
});
router.get('/get/room/:id',isAuthenticated,function(req,res){
  var id = req.params.id;
  Room.findById(id).exec(function(err,doc){
    res.jsonp(doc);
  });
});
router.post('/update/userface',isAuthenticated,function(req,res){
  var tuoi_face =parseInt(req.body.tuoi_face);
  var sex_face =req.body.sex_face;
  var sothich = req.body.sothich;
  User.findById(req.session.passport.user).exec(function(err,doc){
    doc.tuoi  = tuoi_face;
    doc.sex = sex_face;
    doc.sothich = sothich;
    if(sex_face == 'nam'){
      doc.images = '/images/nam.png'
    }else if(sex_face == 'nu'){
      doc.images = '/images/nu.png'
    }
    doc.save(function(err,doc){
      res.jsonp(doc);
    });
  });
});
router.post('/chiatay',function(req,res){
  var id = req.body.room;
  Room.findById(id).exec(function(err,doc){
    var ListBlockNew = new ListBlock({
      userid:doc.useridnu,
      roomid:doc._id
    });
    ListBlockNew.save();
    doc.havenu = false;
    doc.status = '';
    doc.save(function(err,doc){
     Message.find({roomname:req.body.roomname}).remove().exec();
     res.jsonp([{message:'chia tay thanh cong'},{thongtin:doc}]);
    })
  });
});
router.post('/message',function(req,res){
  var content = req.body.content;
  var userid = req.body.userid;
  var images = req.body.images;
  var roomname = req.body.roomname;
  var NewMessage = new Message({
    content: content,
    userid: userid,
    images:images,
    roomname:roomname
  });
  NewMessage.save(function(err,doc){
    res.jsonp(doc);
  });
});
router.post('/get/message',function(req,res){
  var roomname = req.body.roomname;
  Message.find({roomname:roomname}).sort({_id: 'asc'}).exec(function(err,doc){
    res.jsonp(doc);
  });
});
router.post('/thay_doi_thong_tin',function(req,res){
  var id = req.body.id;
  var tuoi = req.body.tuoi;
  var ten = req.body.ten;
  var sothich= req.body.sothich;
  User.findById(id).exec(function(err,doc){
    doc.tuoi = tuoi;
    doc.name = ten;
    doc.sothich = sothich;
    doc.save(function(err,doc){
      res.jsonp(doc);
    });
  });
});
module.exports = router;
