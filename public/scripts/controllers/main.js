define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name angularRequireApp.controller:MainCtrl
   * @description
   * # MainCtrl
   * Controller of the angularRequireApp
   */
  angular.module('angularRequireApp.controllers.MainCtrl', [])
    .controller('MainCtrl', function ($scope,$location,$http,$cookieStore,$window) {
      var socket = io('/');
      $http({
            method:"GET",
            url:"api/checklogin"
          }).then(function successCallback(response){
            console.log(response.data);
            if(response.data.stage == 'firewall'){
                $cookieStore.remove('globals');
                $location.path('/login');
            }else{
              console.log(response);
              $scope.username = response.data.user.username;
              $scope.name = response.data.user.name;
              $scope.images = response.data.user.images;
              $scope.tuoi = response.data.user.tuoi;
              $scope.sothich = response.data.user.sothich;
              $scope.id_user_goc = response.data.user._id;
              $http({
                method:'GET',
                url:'api/user/updatestatus?id='+response.data.user._id+'&status=Online'
              }).then(function successCallback(response){
                socket.emit("dangnhap", { username: $scope.id_user_goc,name:$scope.name,images:$scope.images});
              });
            }
          });
      $scope.logout = function(){
        $http({
          method:"GET",
          url:"api/logout"
        }).then(function successCallback(response){
          if(response.data.logout == "success" || response.data.stage  == "firewall"){
            socket.emit('logout');
            $cookieStore.remove('globals');
            $window.location.href='/';
          }else{
            console.log('Loi logout');
          }
        });
      };
      var xulyroom = function(cb){
        $scope.ten = '';
        $scope.iddoiphuong = '';
        $scope.statusdoiphuong = '';
        $scope.images_doiphuong = '';
        $scope.get_status_phong = '';
        $scope.get_mau_status_phong = '';
        $scope.id_doi_phuong_dang_test = '';
        $http({
          method:"GET",
          url:"api/checklogin"
        }).then(function successCallback(response){
          console.log(response.data);
          if(response.data.user){
            $scope.iduser = response.data.user._id;
            $scope.sex = response.data.user.sex;
            $http({
              method:'GET',
              url:'api/user/updatestatus?id='+$scope.iduser+'&status=Online'
            }).then(function successCallback(response){
              console.log(response.data);
            });
            if($scope.sex == 'nu'){
              $scope.sexvi = 'Nữ'
            }else if($scope.sex == 'nam'){
              $scope.sexvi = 'Nam'
            }
            $http({
            method:"POST",
            url:"api/joinwait",
            data:{user:$scope.iduser,sex:response.data.user.sex}
            }).then(function successCallback(response){
              console.log('wtf'+$scope.sex);
              console.log(response.data);
              $scope.room_id = response.data._id;
              $scope.roomname = response.data.name;
              $scope.usernam_a = response.data.useridnam;
              $scope.usernu_a =  response.data.useridnu;
              $scope.id_phong = response.data._id;
              if(response.data.havenu == true){
                if(!response.data.status){
                    $http({
                      method:"GET",
                      url:"api/room/updatestatus?id="+response.data._id+"&status=Làm quen"
                    }).then(function successCallback(response){
                      $scope.get_status_phong = 'Làm quen';
                      $scope.get_mau_status_phong = 'grey';
                    });
                }else if(response.data.status){
                  $http({
                      method:"GET",
                      url:"api/get/room/"+response.data._id
                    }).then(function successCallback(response){
                      $scope.get_status_phong = response.data.status;
                      switch ($scope.get_status_phong) {
                            case 'Làm quen':
                                $scope.get_mau_status_phong = 'grey';
                                break;
                            case 'Thích thích':
                                $scope.get_mau_status_phong = '#fff36f';
                                break;
                            case 'Hẹn hò':
                                $scope.get_mau_status_phong = '#ff6674';
                                break;
                            case 'Yêu':
                                $scope.get_mau_status_phong = '#fd178e';
                                break;
                            default:
                        }
                    });
                  $http({
                    method:"POST",
                    url:"api/get/message",
                    data:{roomname:$scope.roomname}
                  }).then(function successCallback(response){
                    $scope.datamessage = response.data;
                  });
                }
                if($scope.sex  == 'nu'){
                  $http({
                      method:"GET",
                      url:"api/get/user/"+$scope.usernam_a
                    }).then(function successCallback(response){
                      console.log('test chia tay');
                      console.log(response.data);
                       if(response.data.sex == 'nu'){
                          $scope.gioitinh = 'Nữ'
                        }else if(response.data.sex == 'nam'){
                          $scope.gioitinh = 'Nam'
                        }
                      $scope.ten = response.data.name;
                      $scope.iddoiphuong = $scope.usernam;
                      $scope.statusdoiphuong = response.data.status;
                      $scope.images_doiphuong = response.data.images;
                      $scope.sothich_doiphuong = response.data.sothich;
                      socket.emit("join_wait",{roomname:'wait',doiphuong:response.data._id});
                    });
                  }else if($scope.sex  == 'nam'){
                     $http({
                      method:"GET",
                      url:"api/get/user/"+$scope.usernu_a
                    }).then(function successCallback(response){
                      console.log(response.data._id);
                      console.log(response.data);
                      if(response.data.sex == 'nu'){
                          $scope.gioitinh = 'Nữ'
                        }else if(response.data.sex == 'nam'){
                          $scope.gioitinh = 'Nam'
                        }
                      $scope.iddoiphuong = $scope.usernu;
                      $scope.ten = response.data.name;
                      $scope.statusdoiphuong = response.data.status;
                      $scope.images_doiphuong = response.data.images;
                      $scope.sothich_doiphuong = response.data.sothich;
                      console.log('dis cu'+response.data._id);

                      $scope.id_doi_phuong_dang_test =response.data._id;
                      console.log(socket)
                      socket.emit("join_wait",{roomname:'wait',doiphuong:response.data._id});
                      if (cb) cb(response.data._id);
                    });
                  }
                socket.emit("join_room",$scope.roomname);
              }else if($scope.sex == 'nam'){
                console.log('day la ban nam da tao phong va tham gia phong');
                socket.emit("join_room",$scope.roomname);
              }else if($scope.sex == 'nu'){
                console.log('day la ban nu da tham gia cho');
                socket.emit("join_wait",{roomname:'wait'});
              }
            })
          }
        });
      }
      xulyroom();
      var get_info = function(){
        $http({
          method:"GET",
          url:"api/checklogin"
        }).then(function successCallback(response){
          if(response.data.user){
            $scope.iduser = response.data.user._id;
            $scope.sex = response.data.user.sex;
            if($scope.sex == 'nu'){
              $scope.sexvi = 'Nữ'
            }else if($scope.sex == 'nam'){
              $scope.sexvi = 'Nam'
            }
            $http({
              method:"POST",
              url:"api/joinwait",
              data:{user:$scope.iduser,sex:$scope.sex}
              }).then(function successCallback(response){
                console.log('info socket'+response.data);
                $scope.roomname = response.data.name;
                $scope.usernam = response.data.useridnam;
                $scope.usernu =  response.data.useridnu;
                $scope.room_id = response.data._id;
                if(response.data.havenu == true){
                  if(!response.data.status){
                      $http({
                        method:"GET",
                        url:"api/room/updatestatus?id="+response.data._id+"&status=Làm quen"
                      }).then(function successCallback(response){
                        $scope.get_status_phong = 'Làm quen';
                        $scope.get_mau_status_phong = 'grey';
                      });
                  }else if(response.data.status){
                    $http({
                        method:"GET",
                        url:"api/get/room/"+response.data._id
                      }).then(function successCallback(response){
                        $scope.get_status_phong = response.data.status;
                        switch ($scope.get_status_phong) {
                              case 'Làm quen':
                                  $scope.get_mau_status_phong = 'grey';
                                  break;
                              case 'Thích thích':
                                  $scope.get_mau_status_phong = '#fff36f';
                                  break;
                              case 'Hẹn hò':
                                  $scope.get_mau_status_phong = '#ff6674';
                                  break;
                              case 'Yêu':
                                  $scope.get_mau_status_phong = '#fd178e';
                                  break;
                              default:
                          }
                      });
                  }
                  if($scope.sex  == 'nu'){
                    $http({
                        method:"GET",
                        url:"api/get/user/"+$scope.usernam
                      }).then(function successCallback(response){
                         if(response.data.sex == 'nu'){
                            $scope.gioitinh = 'Nữ'
                          }else if(response.data.sex == 'nam'){
                            $scope.gioitinh = 'Nam'
                          }
                        $scope.ten = response.data.name;
                        $scope.iddoiphuong = $scope.usernam;
                        $scope.statusdoiphuong = response.data.status;
                        $scope.images_doiphuong = response.data.images;
                        $scope.sothich_doiphuong = response.data.sothich;
                      });
                    }else if($scope.sex  == 'nam'){
                       $http({
                        method:"GET",
                        url:"api/get/user/"+$scope.usernu
                      }).then(function successCallback(response){
                        if(response.data.sex == 'nu'){
                            $scope.gioitinh = 'Nữ'
                          }else if(response.data.sex == 'nam'){
                            $scope.gioitinh = 'Nam'
                          }
                        $scope.iddoiphuong = $scope.usernu;
                        $scope.ten = response.data.name;
                        $scope.statusdoiphuong = response.data.status;
                        $scope.images_doiphuong = response.data.images;
                        $scope.sothich_doiphuong = response.data.sothich;
                      });
                    }
                }
              });
            }
          });
      };
      socket.on('to_client_join_wait',function(user_goc,data){
        console.log('xu ly wait');
        if(user_goc == $scope.id_user_goc){
          socket.emit("join_room",data);
          if(data != null){
            $http({
              method:"GET",
              url:"api/get/user/"+user_goc
            }).then(function successCallback(response){
              console.log('wtf'+response.data);
              if(response.data.sex == 'nu'){
                  $scope.gioitinh = 'Nữ'
                }else if(response.data.sex == 'nam'){
                  $scope.gioitinh = 'Nam'
                }
                $scope.iddoiphuong = $scope.usernu;
                $scope.ten = response.data.name;
                $scope.statusdoiphuong = response.data.status;
                $scope.images_doiphuong = response.data.images;
                $scope.sothich_doiphuong = response.data.sothich;
                get_info();
                socket.emit('leave_room_wait','wait',user_goc);
            });
          }else{
            console.log('loi join room ban nu truoc')
          }
        }else{
          socket.emit('leave_room_wait','wait');
        }
      });
      socket.on('subcribe_leave_room_wait',function(){
          socket.emit('leave_room_wait_subcribe','wait');
      })
      socket.on('inforoom',function(data){
        console.log('info'+data);
        if(data != null){
          get_info();
        }else{
          console.log('khong xac dinh')
        }
      });      
      $scope.sendchat= function(message){
        if(message){
          if($('li.mar-btm').hasClass('status-phong-hide')){
            $('.status-phong-hide').fadeOut("slow");
          }
          var messagechat;
          var array_img = [":)",":P",":-)","x-x","o-o","oxo",":zz",";-)","ox-o",":-@",":’(",":’m((",":-&",":&",":((",":-#",">_<",":-((",":@@",":@",":*",":x",":-<",":/",":(",":l(x",":c-c",":satan",":|",";)","o:h-)",">)<","c)cx","c)c",":k))o",":i))(",":g|x",":D","0o0)","0o0",":f((o",":f|o","XxX(",":e(-c","%-g(","%-f((","x:ePx","c:dPo","c:cPd",":b*x",":a/c","8|",":<3",":’)x",":)xo"];
          angular.forEach(array_img,function(value,key){
            if(message.indexOf(value) >= 0){
              if(messagechat){
                messagechat = messagechat.split(value).join('<img class="SizeIcon" src="/images/icon/icon_'+parseInt(key+1)+'.png"/>');
              }else{
                messagechat = message.split(value).join('<img class="SizeIcon" src="/images/icon/icon_'+parseInt(key+1)+'.png"/>');
              }
            }
          });
          if(!messagechat){
            messagechat = message;
          }
          $http({
            method:"POST",
            url:"api/message",
            data:{content:messagechat,userid:$scope.id_user_goc,images:$scope.images,roomname:$scope.roomname}
          }).then(function successCallback(response){
            console.log(response.data);
            socket.emit("send_message", { room_name: $scope.roomname, msg: messagechat,images:$scope.images});
            $http({
              method:"POST",
              url:"api/get/message",
              data:{roomname:$scope.roomname}
            }).then(function successCallback(response){
              $scope.datamessage = response.data;
            });
            $scope.messagechat = '';
            // $('.nano-content.pad-all > ul').append('<li class="mar-btm"><div class="media-right"><img src="'+$scope.images+'" class="img-circle img-sm" alt="Profile Picture"></div><div class="media-body pad-hor speech-right"><div class="speech"><p style="font-size: 13px">'+message+'</p></div></div></li>');
          });
        }
      };
      var scroll_bottom = function(){
        $('.pad-all').animate({scrollTop: $('.pad-all').prop("scrollHeight")}, 0);
      };
      socket.on('new_message',function(images,data){
        // $('.nano-content.pad-all > ul').append('<li class="mar-btm"><div class="media-left"><img src="'+images+'" class="img-circle img-sm" alt="Profile Picture"></div><div class="media-body pad-hor"><div class="speech"><p  style="font-size: 13px">'+data+'</p></div></div></li>');
        // scroll_bottom();
        if($('li.mar-btm').hasClass('status-phong-hide')){
            $('.status-phong-hide').fadeOut("slow");
        }
        $http({
          method:"POST",
          url:"api/get/message",
          data:{roomname:$scope.roomname}
        }).then(function successCallback(response){
          $scope.datamessage = response.data;
        });
      });
      socket.on('has_left_x',function(data){
        console.log('tat'+data);
        if(data != null){
          $http({
            method:"GET",
            url:"api/get/user/"+data
          }).then(function successCallback(response){
            if(response.data.sex == 'nu'){
                $scope.gioitinh = 'Nữ'
              }else if(response.data.sex == 'nam'){
                $scope.gioitinh = 'Nam'
              }
            $scope.iddoiphuong = $scope.usernu;
            $scope.ten = response.data.name;
            $scope.statusdoiphuong = response.data.status;
            $scope.images_doiphuong = response.data.images;
            $scope.sothich_doiphuong = response.data.sothich;
          });
        }else{
          console.log('khong xac dinh')
        }
      });
      socket.on('change_status_phong_to_client',function(images,name,data){
        $('.nano-content.pad-all > ul').append('<li class="mar-btm status-phong-hide"><div class="media-left"><img src="'+images+'" class="img-circle img-sm" alt="Profile Picture"></div><div class="media-body pad-hor"><div class="speech"><p  style="font-size: 13px">Bạn '+name+' đã thay đổi mối quan hệ thành '+data.toLowerCase()+'</p></div></div></li>');
        get_info();
        scroll_bottom();
      });
      $scope.status_phong_function = function(change_status_phong,mau_status){
        if($scope.get_mau_status_phong){
          if($scope.get_mau_status_phong != mau_status){
            $scope.get_mau_status_phong = mau_status;
            $scope.get_status_phong = change_status_phong;
            $http({
              method:"GET",
              url:"api/room/updatestatus?id="+$scope.id_phong+"&status="+change_status_phong
            }).then(function successCallback(response){
              $('.nano-content.pad-all > ul').append('<li class="mar-btm status-phong-hide"><div class="media-right"><img src="'+$scope.images+'" class="img-circle img-sm" alt="Profile Picture"></div><div class="media-body pad-hor speech-right"><div class="speech"><p style="font-size: 13px">Bạn đã thay đổi mối quan hệ thành '+change_status_phong.toLowerCase()+'</p></div></div></li>');
              UIkit.modal('#statusPhong').hide();
              socket.emit("change_status_phong",{status:change_status_phong});
            });
          }
        }
      };
      $scope.change_avartar = function(element) {
        $scope.$apply(function(scope) {
          // Turn the FileList object into an Array
            scope.files = []
            for (var i = 0; i < element.files.length; i++) {
              scope.files.push(element.files[i])
            }
            var file = $scope.files[0];
            var uploadUrl = "/api/photo";
            var fd = new FormData();
            fd.append('file', file);
            $http.post(uploadUrl,fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
            .success(function(response){
              $scope.images = response.images;
            })
            .error(function(){
              console.log("loi upload");
            });
          });
      };
      $scope.open_select_file = function(){
        $('.update_avartar').click();
      };
      $scope.chiatay =function(){
        UIkit.modal.confirm("Bạn chắc chắn là muốn chia tay với bạn "+$scope.ten+" ?", function(){
          $http({
            method:"POST",
            url:"api/chiatay",
            data:{room:$scope.room_id}
          }).then(function successCallback(response){
            socket.emit('chiatay');
            socket.emit('leave_room');
            // xulyroom(function (id) {
            //   socket.emit("join_wait",{roomname:'wait',doiphuong:id});
              
            // });
            xulyroom();
          });
        }, {labels: {'Ok': 'Đồng ý', 'Cancel': 'Không đồng ý '},center:true});
      }
      socket.on('chiatay_to_client',function(){
        xulyroom();
      });
      socket.on('leave_room_to_client',function(){
        socket.emit('leave_room_from_client');
      });
      socket.on('disconnect',function(){
        socket.connect();
      });
      $scope.thay_doi_thong_tin = function(){
        UIkit.offcanvas.hide('#my-id');
        UIkit.modal('#thaydoithongtin', {center: true}).show()
      };
      $scope.update_thong_tin = function(ten,tuoi,sothich){
        $http({
          method:"POST",
          url:"api/thay_doi_thong_tin",
          data:{ten:ten,tuoi:tuoi,sothich:sothich,id:$scope.id_user_goc}
        }).then(function successCallback(response){
          $scope.name = response.data.name;
          $scope.images = response.data.images;
          $scope.tuoi = response.data.tuoi;
          $scope.sothich = response.data.sothich;
          UIkit.notify({
              message : '<i class="uk-icon-check"></i> Đã thay đổi thông tin thành công !',
              status  : 'success',
              timeout : 5000,
              pos     : 'bottom-right'
          });
          UIkit.modal('#thaydoithongtin', {center: true}).hide();
        });
      }
      $( '.uk-button-icon' ).on( 'click', function( e ){
        e.stopPropagation();
        $( '.menu-icon' ).toggleClass( 'active' );
      })
      $( document.body ).on( 'click', function(){
        $( '.menu-icon' ).removeClass( 'active' );
      })
      $scope.getNumber = function(num) {
          return new Array(num);   
      };
      $scope.inputimages = function(e){
        var link_img = $(e.target).data('img');
        var img;
        var array_img = [":)",":P",":-)","x-x","o-o","oxo",":zz",";-)","ox-o",":-@",":’(",":’m((",":-&",":&",":((",":-#",">_<",":-((",":@@",":@",":*",":x",":-<",":/",":(",":l(x",":c-c",":satan",":|",";)","o:h-)",">)<","c)cx","c)c",":k))o",":i))(",":g|x",":D","0o0)","0o0",":f((o",":f|o","XxX(",":e(-c","%-g(","%-f((","x:ePx","c:dPo","c:cPd",":b*x",":a/c","8|",":<3",":’)x",":)xo"];
        angular.forEach(array_img,function(value,key){
          var link_img_check = '/images/icon/icon_'+parseInt(key+1)+'.png';
          if(link_img == link_img_check){
            img = value;
          }
        });
        var messagechat_get = $scope.messagechat;
        // var img = "<img class='SizeIcon' src='"+link_img+"'>";
        if(messagechat_get){
          $scope.messagechat = messagechat_get.trim()+' '+img+' ';
        }else{
          $scope.messagechat = img+' ';
        }
        $('textarea').focus();
        $( '.menu-icon' ).removeClass('active');
      };
      $scope.thongtindoiphuong = function(){
        UIkit.modal('#thongtindoiphuong', {center: true}).show();
      };
  }).directive('selfEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.selfEnter);
                });

                event.preventDefault();
            }
        });
    };
  }).directive('contenteditable', function() {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, element, attr, ngModel) {
        var read;
        if (!ngModel) {
          return;
        }
        ngModel.$render = function() {
          return element.html(ngModel.$viewValue);
        };
        element.bind('blur', function() {
          if (ngModel.$viewValue !== $.trim(element.html())) {
            return scope.$apply(read);
          }
        });
        return read = function() {
          console.log("read()");
          return ngModel.$setViewValue($.trim(element.html()));
        };
      }
    };
  });
});
