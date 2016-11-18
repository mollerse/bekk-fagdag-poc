var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var dots = [];

var CANVAS_X = 6000;
var CANVAS_Y = 6000;

app.get('/', function(req, res){
  fs.createReadStream('index.html').pipe(res);
});
app.get('/bundle.js', function(req, res){
  fs.createReadStream('bundle.js').pipe(res);
});

http.listen(process.env.PORT || 3000);

function random2(l, u) {
  return l + Math.random()*(u-l);
}

for (var i = 0; i < 250; i++) {
  dots.push({tag: i, x: random2(10, CANVAS_X-10), y: random2(10, CANVAS_Y-10), moving: false});
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
