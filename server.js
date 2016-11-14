var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.get('/', function(req, res){
  fs.createReadStream('index.html').pipe(res);
});
app.get('/bundle.js', function(req, res){
  fs.createReadStream('bundle.js').pipe(res);
});

http.listen(3000);

io.on('connection', function(socket) {
  socket.on('join', function(msg){
    socket.emit('join', {tag: '#1', x: Math.random(), y: Math.random()});
  });

  socket.on('move', function(msg) {
    socket.broadcast.emit('move', {tag: msg.tag, x: msg.x, y: msg.y});
  })

  socket.on('disconnect', function() {
    io.emit('disconnect', {tag: '#1'});
  })
})
