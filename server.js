var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var dots = [];

var CANVAS_X = 3000;
var CANVAS_Y = 3000;

app.get('/', function(req, res){
  fs.createReadStream('index.html').pipe(res);
});
app.get('/bundle.js', function(req, res){
  fs.createReadStream('bundle.js').pipe(res);
});

http.listen(3000);

function random2(l, u) {
  return l + Math.random()*(u-l);
}

for (var i = 0; i < 500; i++) {
  dots.push({tag: i, x: random2(0, CANVAS_X), y: random2(0, CANVAS_Y)});
}

io.on('connection', function(socket) {
  var tag = dots.length;

  socket.on('join', function(msg){
    var me = {tag, x: random2(0, CANVAS_X), y: random2(0, CANVAS_Y)};
    socket.emit('join', me);

    dots.forEach(function(dot) {
      socket.emit('move', dot);
    });

    dots.push(me);
  });

  socket.on('move', function(msg) {
    socket.broadcast.emit('move', {tag, x: msg.x, y: msg.y});
  })

  socket.on('disconnect', function() {
    io.emit('disconnect', {tag});
  });
})
