var io = require('socket.io-client');

var socket = io('http://localhost:3000');

var dots = {};
var me = {};

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var HEIGHT = canvas.height;
var WIDTH = canvas.width;

var WINDOW_W = window.innerWidth;
var WINDOW_H = window.innerHeight;

var DX = random2(-1, 1);
var DY = random2(-1, 1);

socket.on('connect', function(){
  socket.emit('join');
});

socket.on('move', function(data){
  dots[data.tag] = data;
});

socket.on('join', function(data){
  dots[data.tag] = data;
  me = data;
});

socket.on('disconnect', function(data){
  var dot = dots[data.tag];
  if(dot) {
    dot.moving = false;
  }
});

function random2(l, u) {
  return l + Math.random()*(u-l);
}

function drawDot(dot, i, dots) {
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'teal';

  Object.keys(dots).forEach(function(tag) {
    if(tag === me.tag) { return; }

    var d = dots[tag];

    if(Math.sqrt(Math.pow(d.x-dot.x, 2) + Math.pow(d.y-dot.y, 2)) < 100) {
      ctx.beginPath();
      ctx.moveTo(dot.x, dot.y);
      ctx.lineTo(d.x, d.y);
      ctx.closePath();
      ctx.stroke();
    }
  });

  var r = 2.5;
  if(dot === me) {
    ctx.fillStyle = 'red';
    r = 5;
  }

  ctx.beginPath();
  ctx.moveTo(dot.x, dot.y);
  ctx.arc(dot.x, dot.y, r, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
}

function draw() {
  var lastFrame = 0;

  function inner(t) {
    requestAnimationFrame(inner);

    var delta = t - lastFrame;

    if(lastFrame && delta < (16/(25/60))+1) { return; }

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    Object.entries(dots)
      .filter(function([tag, dot]) {
        return dot.x < (me.x + 0.5 * WINDOW_W)
        && dot.x > (me.x - 0.5 * WINDOW_W)
        && dot.y < (me.y + 0.5 * WINDOW_H)
        && dot.y > (me.y - 0.5 * WINDOW_H);
      })
      .map(([tag,dot]) => dot)
      .forEach(drawDot);

    var _x = me.x - 0.5*WINDOW_W ;
    var _y = me.y - 0.5*WINDOW_H;

    canvas.style.transform = `translate(${-_x}px, ${-_y}px)`;

    me.x = me.x + DX;
    me.y = me.y + DY;
    socket.emit('move', me);
  }

  requestAnimationFrame(inner);
}

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

draw();
