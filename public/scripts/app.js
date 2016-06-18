/*jshint unused: vars */
define(['angular', 'controllers/main', 'controllers/login']/*deps*/, function (angular, MainCtrl, AboutCtrl)/*invoke*/ {
  'use strict';

  /**
   * @ngdoc overview
   * @name angularRequireApp
   * @description
   * # angularRequireApp
   *
   * Main module of the application.
   */
  return angular
    .module('angularRequireApp', [
      'angularRequireApp.controllers.MainCtrl',
      'angularRequireApp.controllers.LoginCtrl',
      'ngCookies',
      'ngRoute',
      'luegg.directives',
      'angular-nicescroll',
      'ngAnimate',
      'ngSanitize'
])
    .config(function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'views/main.html',
          controller: 'MainCtrl',
          controllerAs: 'main',
          reloadOnSearch: false
        })
        .when('/login', {
          templateUrl: 'views/login.html',
          controller: 'LoginCtrl',
          controllerAs: 'login',
          reloadOnSearch: false
        })
        .otherwise({
          redirectTo: '/'
        });
    }).run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
      console.log('t');
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
          console.log(JSON.stringify($rootScope.globals.currentUser));
        }
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');
            }
        });
    }]);
});
