

function Game(w, h, size, speed) {
  this.envDom = document.getElementById("env");
  this.context = this.envDom.getContext('2d');
  this.envDom.width = w * size;
  this.envDom.height = h * size;

  this.statsDom = document.getElementById("stats");
  this.board = [];
  this.height = h;
  this.width = w;
  this.size = size;
  this.speed = speed;
  this.pause = false;
  this.count = 0;
  this.mousePos = 0;

}

/**
 * @param  {Number} min The minimum number, inclusive.
 * Linear Congruential Generator
 * @param  {Number} max The maximum number, exclusive.
 * @return {Number}     The generated random number.
 */

Game.prototype.lng = function (min, max) {
  max = max || 1;
  min = min || 0;

  this.seed = (this.seed * 9301 + 49297) % 233280;

  var rnd = this.seed / 233280;

  return Math.floor(min + rnd * (max - min));
};

function getMousePos(canvas, evt, ratio) {

  var rect = canvas.getBoundingClientRect();
  return {
    xGrid: Math.floor((evt.clientX - rect.left) / ratio) * ratio,
    yGrid: Math.floor((evt.clientY - rect.top) / ratio) * ratio,
    xx: Math.floor((evt.clientX - rect.left) / ratio),
    yy: Math.floor((evt.clientY - rect.top) / ratio),
    x: Math.floor((evt.clientX - rect.left)),
    y: Math.floor((evt.clientY - rect.top))

  };
}

Game.prototype.updatemouse = function(evt) {

  this.mousePos = getMousePos(this.envDom, evt, this.size);

};

Game.prototype.start = function () {

  this.envDom.addEventListener('mousemove', this.updatemouse.bind(this), false);

  setInterval(this.loop.bind(this), this.speed)

};

Game.prototype.step = function () {

  this.count++;

};


/**
 * Creates loop based on t
 */
Game.prototype.loop = function () {

  this.step();
  this.draw();
};

Game.prototype.draw = function () {

  this.context.clearRect(0, 0, this.envDom.width, this.envDom.height);
  this.drawCanvas();
  writeMessage(this.envDom, JSON.stringify(this.mousePos));
};


Game.prototype.drawCanvas = function () {

  var context = this.envDom.getContext('2d');

  for (var y = 0; y < this.height; y++) {
    var yy = y * this.size;
    for (var x = 0; x < this.width; x++) {
      var xx = x * this.size;
      // context.fillStyle = "#" + this.colors[this.board[y][x]];
      context.strokeRect(xx, yy, this.size, this.size);
      if (this.mousePos !== 0 && x === this.mousePos.xx && y === this.mousePos.yy){
        context.beginPath();
        context.arc(this.mousePos.xGrid + this.size / 2, this.mousePos.yGrid + this.size / 2, this.size / 3, 0, 2 * Math.PI);
        context.stroke();
      }
    }
  }


};


function writeMessage(canvas, message) {

  var context = canvas.getContext('2d');
  context.clearRect(5, 5, 400, 25);
  context.font = '11pt Calibri';
  context.fillStyle = 'black';
  context.fillText(message, 10, 25);

}




function randomNumBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomWeightedNumBetween(min, max) {
  return Math.floor(Math.pow(Math.random(), 2) * (max - min + 1) + min);
}

function randomChoice(propOne, propTwo) {
  if (Math.round(Math.random()) === 0) {
    return clone(propOne);
  } else {
    return clone(propTwo);
  }
}


/**
 * Shape Class
 * @param shape
 * @constructor
 */
function Actor(x, y) {

  this.type = 1;
  this.x = x;
  this.y = y;

}