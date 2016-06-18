define(['angular'], function (angular) {
  'use strict';

  /**
   * @ngdoc function
   * @name angularRequireApp.controller:AboutCtrl
   * @description
   * # AboutCtrl
   * Controller of the angularRequireApp
   */
  angular.module('angularRequireApp.controllers.LoginCtrl', [])
    .controller('LoginCtrl', function ($scope, $rootScope, $location, AuthenticationService,$http,$window) {
          $http({
            method:"GET",
            url:"api/checklogin"
          }).then(function successCallback(response){
            if(response.data.stage == 'firewall'){
                AuthenticationService.ClearCredentials();
            }else{
                $scope.idFace = response.data.user.idFace;
                $scope.id = response.data.user._id;
                if(!response.data.user.sex || !response.data.user.tuoi || !response.data.user.sothich){
                    UIkit.modal('#update_tt', {center: true}).show();
                }else{
                    AuthenticationService.Login($scope.idFace,$scope.id,function (response) {
                        if (response.success) {
                            AuthenticationService.SetCredentials($scope.idFace,$scope.id);
                            $window.location.href='/';
                        } else {
                            $scope.error = response.message;
                            $scope.dataLoading = false;
                        }
                    });
                }
            }
          });
          $scope.update_face = function(tuoi_face,sex_face,sothich){
            if(!tuoi_face||!sex_face||!sothich){
                UIkit.notify({
                    message : 'Bạn không được bỏ trống !',
                    status  : 'warning',
                    timeout : 5000,
                    pos     : 'top-left'
                });
            }else{
                console.log(tuoi_face);
                $http({
                    method:"POST",
                    url:"/api/update/userface",
                    data:{tuoi_face:tuoi_face,sex_face:sex_face,sothich:sothich}
                }).then(function successCallback(response){
                    if(response.data._id){
                        AuthenticationService.Login($scope.idFace,$scope.id,function (response) {
                            if (response.success) {
                                AuthenticationService.SetCredentials($scope.idFace,$scope.id);
                                $window.location.href='/';
                            } else {
                                $scope.error = response.message;
                                $scope.dataLoading = false;
                            }
                        });
                    }else{
                        console.log('login face loi');
                    }
                });
            }
          };
          $scope.signup = function(email,name,username,password,sex,tuoi){
            $http({
                method:"POST",
                url:"api/signup",
                data:{email:email,name:name,username:username,password:password}
            }).then(function successCallback(response){
                if(response.data._id){
                    $scope.email = '';
                    $scope.username = '';
                    $scope.name = '';
                    $scope.password_dk = '';
                    $scope.usernametmp = response.data.username;
                    UIkit.modal('#kickhoat', {center: true}).show();
                }else if(response.data.message == 'Missing credentials'){
                    UIkit.notify({
                        message : '<i class="uk-icon-close"></i> Không được bỏ tống !',
                        status  : 'warning',
                        timeout : 5000,
                        pos     : 'top-left'
                    });
                }else if(response.data.require == true){
                    UIkit.notify({
                        message : '<i class="uk-icon-close"></i> Tài khoản đã tồn tại !',
                        status  : 'warning',
                        timeout : 5000,
                        pos     : 'top-left'
                    });
                }
            });
          };
          $scope.dangnhap = function(username,password){
            $http({
                method:"POST",
                url:"api/dangnhap",
                data:{username:username,password:password}
            }).then(function successCallback(response){
                console.log(response.data);
                if(response.data.config === false){
                    UIkit.notify({
                        message : '<i class="uk-icon-close"></i> Bạn chưa kíck hoạt!',
                        status  : 'warning',
                        timeout : 5000,
                        pos     : 'top-left'
                    });
                    $scope.usernametmp = username;
                    UIkit.modal('#kickhoat', {center: true}).show();
                }else if(response.data.fail_user||response.data.message == "Missing credentials"){
                    UIkit.notify({
                        message : '<i class="uk-icon-close"></i> Sai tài khoản hoặc mật khẩu !',
                        status  : 'warning',
                        timeout : 5000,
                        pos     : 'top-left'
                    });
                }else if(response.data.password == false){
                    UIkit.notify({
                        message : '<i class="uk-icon-close"></i> Sai mật khẩu !',
                        status  : 'warning',
                        timeout : 5000,
                        pos     : 'top-left'
                    });
                }else{
                    if(response.data.stage == 'firewall'){
                        AuthenticationService.ClearCredentials();
                    }else if(!response.data.sex || !response.data.tuoi || !response.data.sothich){
                        UIkit.modal('#update_tt', {center: true}).show();
                    }else{
                        $scope.username = response.data.username;
                        $scope.password = response.data.password;
                        AuthenticationService.Login($scope.username,$scope.id,function (response) {
                            if (response.success) {
                                AuthenticationService.SetCredentials($scope.username,$scope.password);
                                $window.location.href='/';
                            } else {
                                $scope.error = response.message;
                                $scope.dataLoading = false;
                            }
                        });
                    }
                }
            });
          };
          $scope.kickhoat = function(makh){
            $http({
                method:"POST",
                url:"api/kickhoat",
                data:{makh:makh,username:$scope.usernametmp}
            }).then(function successCallback(response){
                if(response.data.config === true && response.data.login == true){
                    $scope.makickhoat = '';
                    UIkit.modal('#update_tt', {center: true}).show();
                    UIkit.notify({
                        message : '<i class="uk-icon-check"></i> Kích hoạt thành công !',
                        status  : 'success',
                        timeout : 5000,
                        pos     : 'top-left'
                    });
                }else{
                    $scope.makickhoat = '';
                    UIkit.modal('#dang-nhap', {center: true}).show();
                    UIkit.notify({
                        message : '<i class="uk-icon-check"></i> Kích hoạt thành công !',
                        status  : 'success',
                        timeout : 5000,
                        pos     : 'top-left'
                    });
                }
            })
          };
    })
.factory('AuthenticationService',
    ['Base64', '$http', '$cookieStore', '$rootScope',
    function (Base64, $http, $cookieStore, $rootScope) {
        var service = {};

        service.Login = function (key, value, callback) {

            /* Dummy authentication for testing, uses $timeout to simulate api call
             ----------------------------------------------*/
                var response = { success: true };
                callback(response);


            /* Use this for real authentication
             ----------------------------------------------*/
            //$http.post('/api/authenticate', { username: username, password: password })
            //    .success(function (response) {
            //        callback(response);
            //    });

        };

        service.SetCredentials = function (key, value) {
            var token = Base64.encode(key + ':' + value);

            $rootScope.globals = {
                currentUser: {
                    username: key,
                    token: token
                }
            };
 console.log($rootScope.globals);
            $cookieStore.put('globals', $rootScope.globals);
        };

        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
        };

        return service;
    }])

.factory('Base64', function () {
    /* jshint ignore:start */

    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };

    /* jshint ignore:end */
});
});
