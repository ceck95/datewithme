/*jshint unused: vars */
require.config({
  paths: {
    angular: '../../bower_components/angular/angular',
    'angular-animate': '../../bower_components/angular-animate/angular-animate',
    'angular-cookies': '../../bower_components/angular-cookies/angular-cookies',
    'angular-mocks': '../../bower_components/angular-mocks/angular-mocks',
    'angular-route': '../../bower_components/angular-route/angular-route',
    bootstrap: '../../bower_components/bootstrap/dist/js/bootstrap',
    uikit:'../../bower_components/uikit/js/uikit',
    notify:'../../bower_components/uikit/js/components/notify',
    jquery:'../../bower_components/jquery/dist/jquery',
    chat:'../../styles/chat',
    scroll:'../../bower_components/jquery/dist/jquery.mCustomScrollbar.concat.min',
    scroll_glue:'../../bower_components/angular-scroll-glue/src/scrollglue',
    datepicker:'../../bower_components/uikit/js/components/datepicker',
    tooltip:'../../bower_components/uikit/js/components/tooltip',
    nicescroll:'../../bower_components/angular-nicescroll/angular-nicescroll',
    jquery_nicescroll:'../../bower_components/jquery.nicescroll/jquery.nicescroll.min',
    angular_sanitize:'../../bower_components/angular-sanitize/angular-sanitize',
  },
  shim: {
    angular: {
      exports: 'angular'
    },
    jquery:{
      exports:'jquery',
    },
    uikit:[
      'jquery',
    ],
    notify:[
      'uikit',
    ],
    datepicker:[
      'uikit'
    ],
    jquery_nicescroll:[
      'jquery'
    ],
    nicescroll:[
      'angular'
    ],
    angular_sanitize:[
      'angular'
    ],
    'angular-route': [
      'angular',
    ],
    'scroll_glue':[
      'angular'
    ],
    'angular-cookies': [
      'angular'
    ],
    'angular-animate': [
      'angular'
    ],
    'angular-mocks': {
      deps: [
        'angular'
      ],
      exports: 'angular.mock'
    }
  },
  priority: [
    'angular'
  ],
  packages: [

  ]
});

//http://code.angularjs.org/1.2.1/docs/guide/bootstrap#overview_deferred-bootstrap
window.name = 'NG_DEFER_BOOTSTRAP!';

require([
  'angular',  
  'app',
  'uikit',
  'notify',
  'datepicker',
  'jquery_nicescroll',
  'nicescroll',
  'angular_sanitize',
  'angular-route',
  'scroll_glue',
  'angular-cookies',
  'angular-animate'
], function(angular, app, ngRoutes, ngCookies, ngAnimate) {
  'use strict';
  /* jshint ignore:start */
  var $html = angular.element(document.getElementsByTagName('html')[0]);
  /* jshint ignore:end */
  angular.element().ready(function() {
    angular.resumeBootstrap([app.name]);
  });
});
