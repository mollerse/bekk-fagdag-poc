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

var DX = random2(-2, 2);
var DY = random2(-2, 2);

var r = 30;
var initScale = 1.5;

socket.on('connect', function(){
  socket.emit('join');
});

socket.on('move', function(data){
  if(dots[data.tag]) {
    data.moving = true;
  }
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
  ctx.fillStyle = '#2d2d2d';
  ctx.strokeStyle = '#2d2d2d';
  ctx.strokeWidth = 3;

  var innerR = 10;

  dots.forEach(function(d) {
    if(dot === d) { return; }

    var dist = Math.sqrt(Math.pow(d.x-dot.x, 2) + Math.pow(d.y-dot.y, 2));

    if(dist < 150) {
      ctx.beginPath();
      ctx.moveTo(dot.x, dot.y);
      ctx.lineTo(d.x, d.y);
      ctx.closePath();
      ctx.stroke();

      if(dot === me) {
        DX = DX - ((me.x - d.x)/dist)*0.01;
        DY = DY - ((me.y - d.y)/dist)*0.01;
      }
    }
  });

  if (dot === me) {
    ctx.fillStyle = 'white';
    innerR = r;
  } else if (dot.moving) {
    ctx.fillStyle = '#b3b3b3';
    innerR = r;
  }

  ctx.beginPath();
  ctx.moveTo(dot.x, dot.y);
  ctx.arc(dot.x, dot.y, innerR, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "white";
  if(dot === me) {
    ctx.fillText(`#${dot.tag}`, dot.x + innerR + 5, dot.y);
    ctx.fillText(`${Math.floor(dot.x) - WIDTH*0.5}, ${-1*(Math.floor(dot.y) - HEIGHT*0.5)}`, dot.x + innerR + 5, dot.y + 10);
  } else {
    ctx.fillText(`#${dot.tag}`, dot.x + innerR + 5, dot.y + innerR + 5);
  }
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

    var _x = (me.x - 0.5*WINDOW_W);
    var _y = (me.y - 0.5*WINDOW_H);

    canvas.style.transform = `translate(${-_x}px, ${-_y}px)`;

    if(me.x > WIDTH - r - 10 || me.x < 0 + r + 10) {
      DX = -1 * DX;
    }

    if(me.y > HEIGHT - r - 10 || me.y < 0 + r + 10) {
      DY = -1 * DY;
    }

    // DX += random2(-0.1, 0.1);
    // DY += random2(-0.1, 0.1);

    me.x = me.x + DX;
    me.y = me.y + DY;


    socket.emit('move', me);
  }

  requestAnimationFrame(inner);
}

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, WIDTH, HEIGHT);

draw();
