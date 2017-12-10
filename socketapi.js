var socket_io = require('socket.io');
var io = socket_io();
var socketapi = {};

socketapi.io = io;

io.on('connection', function(socket){
    console.log('New client connection');
});

module.exports = socketapi;
