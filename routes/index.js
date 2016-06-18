var express = require('express');
var router = express.Router();
var passport = require('../config-passport')
var User = require('../model/User');
var isAuthenticated = require('../middleware/passport');
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});
router.get('/auth/facebook',
  passport.authenticate('facebook'));

router.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
module.exports = router;
