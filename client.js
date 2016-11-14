var io = require('socket.io-client');

var socket = io('http://localhost:3000');

socket.on('connect', function(){
  socket.emit('join');
});

socket.on('move', function(data){
  console.log(data);
});

socket.on('join', function(data){
  console.log(data);
  console.log('welcome to the game');
});

socket.on('disconnect', function(){
  console.log('you disconnected');
});

socket.emit('move', {tag: Math.random(), x: 10, y: 10});
