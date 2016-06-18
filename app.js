var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var api = require('./routes/api');
var passport = require('./config-passport');
var User = require('./model/User');
var ListBlock = require('./model/ListBlock');
var app = express();
// view engine setup
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);
app.use('/api', api);

/// catch 404 and forwarding to error handler
/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
var socket = require('socket.io');
var server = app.listen(3000);
var io = socket.listen(server);

io.on('connection', function(socket){
    socket.on('dangnhap', function(data){
        socket.username = data.username;
        socket.name = data.name;
        socket.images = data.images;
    })
    socket.on('join_room', function(room_name){
        socket.join(room_name);
        socket.broadcast.to(room_name).emit('inforoom', socket.username);
        socket.room = room_name;
    });
    socket.on('join_wait', function(data){
        socket.join(data.roomname);
        if(data.doiphuong){
            socket.broadcast.to(data.roomname).emit('to_client_join_wait',data.doiphuong,socket.room);
        }
    });
    socket.on('send_message', function(data){
        socket.broadcast.to(socket.room).emit('new_message',data.images,data.msg);
    });
    socket.on('change_status_phong', function(data){
        socket.broadcast.to(socket.room).emit('change_status_phong_to_client',socket.images,socket.name,data.status);
    });
    socket.on('chiatay',function(){
        socket.broadcast.to(socket.room).emit('chiatay_to_client');
    });
    socket.on('leave_room_wait',function(room_wait){
        socket.broadcast.to(socket.room).emit('subcribe_leave_room_wait');
        socket.leave(room_wait);
    });
    socket.on('leave_room_wait_subcribe',function(wait){
        socket.leave(wait);
    });
    socket.on('leave_room',function(){
        socket.broadcast.to(socket.room).emit('leave_room_to_client');
        delete socket.room;
        socket.leave(socket.room);
        socket.disconnect();
    });
    socket.on('leave_room_from_client',function(){
        delete socket.room;
        socket.leave(socket.room);
        socket.disconnect();
    });
    socket.on('disconnect', function(){
        if(socket.username){
          User.findById(socket.username).exec(function(err,doc){
            doc.status = 'Offline';
            doc.save();
          });
        }
        socket.broadcast.to(socket.room).emit('has_left_x', socket.username);
        delete socket.username;
        delete socket.room;
        socket.leave(socket.room);
    });
});
module.exports = app;
