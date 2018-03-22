var socket_io = require('socket.io');
var io = socket_io();
var socketapi = {};

socketapi.io = io;

module.exports = socketapi;
