var app = require('./app');
var socket = require('socket.io');
var server = app.listen(3000);
var io = socket.listen(server);
module.exports = io;
