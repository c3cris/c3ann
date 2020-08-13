/**
 * Shape Class
 * @param shape
 * @constructor
 */
function Game(w, h, size, speed) {
  this.envDom = document.getElementById("env");
  this.context = this.envDom.getContext('2d');
  this.envDom.width = w * size;
  this.envDom.height = h * size;

  this.statsDom = document.getElementById("stats");
  this.inputDom = document.getElementById("input");
  this.board = new Board(w, h);
  this.height = h;
  this.width = w;
  this.size = size;
  this.speed = speed;
  this.resetBoard = 0;
  this.change = 0;
  this.pause = false;
  this.count = 0;
  this.mousePos = 0;
  this.net = new ANN(this.board, ( w - 2 ) * ( h - 2 ) , 20, 10);
  this.net.init();
  this.input();


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


Game.prototype.updatemouse = function (evt) {

  this.mousePos = getMousePos(this.envDom, evt, this.size);
  if (evt.which === 1) {
    this.board.fill(this.mousePos.xx, this.mousePos.yy);
    this.change = 1;
  }

};

Game.prototype.start = function () {

  this.envDom.addEventListener('mousemove', this.updatemouse.bind(this), false);
  this.envDom.addEventListener('mousedown', this.updatemouse.bind(this), false);

  setInterval(this.loop.bind(this), this.speed)

};

Game.prototype.step = function () {


  this.count++;
  if (this.resetBoard) {
    this.resetBoard = 0;
    this.board.reset();
  }
  if (this.change) {
    // this.board.input = [[].concat.apply([], this.board.board)];
    // console.log(this.board.input)

    this.board.input = this.board.convalute([[1, 1, 1], [1, 1, 1], [1, 1, 1]]);
    this.net.forward();
    this.change = false;
  }

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
  this.drawStats();
  this.drawNetwork();
  // writeMessage(this.envDom, JSON.stringify(this.mousePos));

};


Game.prototype.drawNetwork = function () {

  var networkDom = document.getElementById("network");
  var network = networkDom.getContext('2d');
  network.clearRect(0, 0, networkDom.width, networkDom.height);


  var y = 100;
  for (var k = 0; k < this.board.input[0].length; k++) {
    var yy = y + 60 * k;

    network.lineWidth = 2;
    network.beginPath();
    network.arc(50, yy, 25, 0, 2 * Math.PI);
    network.stroke();
    network.font = '10pt Arial';
    network.fillStyle = 'black';
    network.fillText(this.board.input[0][k], 47, yy);

  }


  for (var k = 0; k < this.net.hidden[0].length; k++) {
    var yy = y + 60 * k;
    network.beginPath();
    network.arc(250, yy, 25, 0, 2 * Math.PI);
    network.stroke();
    network.font = '10pt Arial';
    network.fillStyle = 'black';
    network.fillText(round(this.net.hidden[0][k], 4), 240, yy);

  }


  var max_id = indexOfMax(this.net.output[0]);

  for (var k = 0; k < this.net.output[0].length; k++) {
    var yy = y + 60 * k;
    network.beginPath();
    network.arc(450, yy, 25, 0, 2 * Math.PI);
    network.stroke();
    network.font = '10pt Arial';

    network.fillStyle = k == max_id ? 'red' : 'black';

    network.fillText(round(this.net.output[0][k], 2), 440, yy);

    network.fillText(k, 500, yy);

  }

  for (var k = 0; k < this.net.W1.length; k++) {
    var yy = y + 60 * k;
    for (var n = 0; n < this.net.W1[0].length; n++) {

      network.beginPath();
      network.lineWidth = Math.min(this.net.W1[k][n], 20);
      network.strokeStyle = "gray"; // Green path
      network.moveTo(75, yy);
      network.lineTo(225, y + n * 60);
      network.stroke(); // Draw it


    }
}


  for (var k = 0; k < this.net.W2.length; k++) {
    var yy = y + 60 * k;
    for (var n = 0; n < this.net.W2[0].length; n++) {

      network.beginPath();
      network.lineWidth = Math.min(this.net.W2[k][n], 20);
      network.strokeStyle = "gray"; // Green path
      network.moveTo(275, yy);
      network.lineTo(425, y + n * 60);
      network.stroke(); // Draw it
    }

  }
  // network.

};


Game.prototype.train = function () {


  var test = [
    [0, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 0, 1, 1],
    [0, 1, 0, 0],
    [0, 1, 0, 1],
    [0, 1, 1, 0],
    [0, 1, 1, 1]
  ];


  var test2 = [[0.2222222222222222,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.2222222222222222,0,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0.2222222222222222,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.2222222222222222,0,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.2222222222222222,0.1111111111111111,0],[0,0,0.2222222222222222,0.2222222222222222,0.2222222222222222,0,0,0,0,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0,0,0,0,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0,0,0,0,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0,0,0,0,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0,0,0,0,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0,0,0,0,0,0.2222222222222222,0.2222222222222222,0.2222222222222222,0,0,0,0,0,0.1111111111111111,0.1111111111111111,0.1111111111111111,0,0,0],[0,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.2222222222222222,0.1111111111111111,0,0.1111111111111111,0.3333333333333333,0.4444444444444444,0.4444444444444444,0.4444444444444444,0.3333333333333333,0.2222222222222222,0,0.2222222222222222,0.4444444444444444,0.5555555555555556,0.4444444444444444,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.2222222222222222,0.4444444444444444,0.4444444444444444,0.3333333333333333,0,0.1111111111111111,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.2222222222222222,0,0,0.1111111111111111,0.3333333333333333,0.5555555555555556,0.5555555555555556,0.3333333333333333,0.1111111111111111,0,0.1111111111111111,0.3333333333333333,0.6666666666666666,0.7777777777777778,0.6666666666666666,0.3333333333333333,0.1111111111111111,0,0.1111111111111111,0.3333333333333333,0.5555555555555556,0.5555555555555556,0.4444444444444444,0.2222222222222222,0.1111111111111111,0],[0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.2222222222222222,0.1111111111111111,0,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.2222222222222222,0,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0,0,0.1111111111111111,0.2222222222222222,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0,0,0.1111111111111111,0.2222222222222222,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0,0,0.1111111111111111,0.2222222222222222,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.2222222222222222,0],[0.1111111111111111,0.1111111111111111,0.1111111111111111,0,0,0,0,0,0.2222222222222222,0.2222222222222222,0.2222222222222222,0,0,0,0,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.1111111111111111,0.1111111111111111,0.1111111111111111,0,0,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.4444444444444444,0.4444444444444444,0.3333333333333333,0.1111111111111111,0,0.2222222222222222,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.5555555555555556,0.4444444444444444,0.1111111111111111,0,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.5555555555555556,0.5555555555555556,0.4444444444444444,0.1111111111111111,0,0,0,0,0.2222222222222222,0.2222222222222222,0.2222222222222222,0,0,0,0,0,0.1111111111111111,0.1111111111111111,0.1111111111111111,0,0],[0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.2222222222222222,0.1111111111111111,0,0.2222222222222222,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.3333333333333333,0.2222222222222222,0.1111111111111111,0,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.3333333333333333,0.2222222222222222,0.1111111111111111,0,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.3333333333333333,0.2222222222222222,0.1111111111111111,0,0.2222222222222222,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.2222222222222222,0,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.2222222222222222,0],[0.1111111111111111,0.1111111111111111,0.1111111111111111,0,0,0,0,0,0.2222222222222222,0.2222222222222222,0.2222222222222222,0,0,0,0,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0,0,0,0,0,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.3333333333333333,0.2222222222222222,0.1111111111111111,0,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.2222222222222222,0,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0.2222222222222222,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.2222222222222222,0],[0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.2222222222222222,0.1111111111111111,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.4444444444444444,0.2222222222222222,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.4444444444444444,0.6666666666666666,0.7777777777777778,0.5555555555555556,0.2222222222222222,0,0,0.1111111111111111,0.3333333333333333,0.5555555555555556,0.5555555555555556,0.3333333333333333,0.1111111111111111,0,0.1111111111111111,0.3333333333333333,0.5555555555555556,0.5555555555555556,0.3333333333333333,0.1111111111111111,0,0.1111111111111111,0.3333333333333333,0.5555555555555556,0.5555555555555556,0.3333333333333333,0.1111111111111111,0,0,0.2222222222222222,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.1111111111111111,0,0,0,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.1111111111111111,0,0,0,0],[0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.2222222222222222,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.2222222222222222,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0.2222222222222222,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.2222222222222222],[0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.3333333333333333,0.2222222222222222,0.1111111111111111,0,0.2222222222222222,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.2222222222222222,0,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0.3333333333333333,0.4444444444444444,0.5555555555555556,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0.2222222222222222,0.3333333333333333,0.4444444444444444,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0.1111111111111111,0.2222222222222222,0.3333333333333333,0.3333333333333333,0.5555555555555556,0.4444444444444444,0.3333333333333333,0,0,0,0,0,0.3333333333333333,0.3333333333333333,0.3333333333333333,0,0,0,0,0,0.2222222222222222,0.2222222222222222,0.2222222222222222,0]];
  var actual = [
    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [ 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [ 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [ 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [ 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [ 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [ 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  ];


  for (var k = 0; k < 20000; k++) {

    this.board.input = test2;
    this.net.forward();

    var error = sub_matries(actual, this.net.output);


    total_sum = [];
    for (var e = 0; e < error.length; e++) {
      var sum = 0;

      for (var ee = 0; ee < error[0].length; ee++) {
        sum += Math.abs(error[e][ee]);
      }
      total_sum.push(sum);
    }


    var errorRate = [];
    for (var e = 0; e < total_sum.length; e++)
    {
      errorRate.push(round(sum / error.length, 4));
    }


    if (k % 1000 === 0 )
    {
      this.drawNetwork();
      console.log(k, errorRate);
    }


    var k2_delta = [];



    k2_delta =  mul_matries(error ,  op_matrix(this.net.output , function(x){ return sigmoidPrime(x);}));






    // console.log(k2_delta);

    var W2_T = transpose(this.net.W2);
    // var W1_T = transpose(this.net.W1);

    // console.log(W2_T);

    var k1_error = multiply_matrix(k2_delta, W2_T);

    // console.log(k1_error);


    var k1_delta = [];

    k1_delta =  mul_matries(k1_error ,  op_matrix(this.net.hidden , function(x){ return sigmoidPrime(x);}));

    // console.log(k1_delta);

    this.net.W2 =  add_matries(this.net.W2, multiply_matrix(transpose(this.net.hidden), k2_delta));
    this.net.W1 =  add_matries(this.net.W1, multiply_matrix(transpose(this.board.input), k1_delta));


  }

  return alert("Done Training!");

};




Game.prototype.backpropagate = function (actual) {


  // var test = [
  //   [0, 0, 0, 1],
  //   [0, 0, 1, 0],
  //   [0, 0, 1, 1],
  //   [0, 1, 0, 0],
  //   [0, 1, 0, 1],
  //   [0, 1, 1, 0],
  //   [0, 1, 1, 1]
  // ];
  //
  // var actual = [
  //   [ 0, 1, 0],
  //   [ 0, 1, 1],
  //   [ 1, 0, 0],
  //   [ 1, 0, 1],
  //   [ 1, 1, 0],
  //   [ 1, 1, 1],
  //   [ 0, 0, 1]
  // ];


  for (var k = 0; k < 2; k++) {

    // this.board.input = test;
    this.net.forward();

    var error = sub_matries(actual, this.net.output);


    total_sum = [];
    for (var e = 0; e < error.length; e++) {
      var sum = 0;

      for (var ee = 0; ee < error[0].length; ee++) {
        sum += Math.abs(error[e][ee]);
      }
      total_sum.push(sum);
    }


    var errorRate = [];
    for (var e = 0; e < total_sum.length; e++)
    {
      errorRate.push(round(sum / error.length, 4));
    }


    console.log(errorRate);


    var k2_delta = [];
	function trainingRate(x){ return x * this.net.trainRate;}


    k2_delta =  mul_matries(op_matrix(error,trainingRate(x))),  op_matrix(this.net.output , function(x){ return sigmoidPrime(x);}));






    // console.log(k2_delta);

    var W2_T = transpose(this.net.W2);
    // var W1_T = transpose(this.net.W1);

    // console.log(W2_T);

    var k1_error = multiply_matrix(k2_delta, W2_T);

    // console.log(k1_error);


    var k1_delta = [];

    k1_delta =  mul_matries(k1_error ,  op_matrix(this.net.hidden , function(x){ return sigmoidPrime(x);}));

    // console.log(k1_delta);

    this.net.W2 =  add_matries(this.net.W2, multiply_matrix(transpose(this.net.hidden), k2_delta));
    this.net.W1 =  add_matries(this.net.W1, multiply_matrix(transpose(this.board.input), k1_delta));


  }


};

function transpose(arr) {

  array = arr[0].map(function (col, i) {
    return arr.map(function (row) {
      return row[i];
    });
  });
  return array;
}


Game.prototype.drawStats = function () {

  var html = "<table id='tablestats'>";

  for (var y = 0; y < this.board.input.length; y++) {

    html += "<tr>";
    // for (var x = 0; x < this.board.board.length; x++) {

      html += "<td>" +  JSON.stringify( this.board.input[y], 2, null) + "</td>";

    // }
    html += "<tr>";
  }

  html += "</table>";
  var temp_output  = op_matrix( this.net.output , function(x) { return  round(x, 5) } );

  for (var y = 0; y < temp_output.length; y++) {

    html += "y" + y + " = " + JSON.stringify(temp_output[y], 2, null) + "<br>";


  }

  this.statsDom.innerHTML = html;

};


Game.prototype.input = function () {

  var html = "<table id='checkboxtable'>";

  for (var y = 0; y < this.net.outputLayerSize; y++) {

    html += "<tr>";
    // for (var x = 0; x < this.board.board.length; x++) {

      html += "<td>" + "  <td><input type='radio' name='checkboxes' value='"+y+"'>"+y+"</td>" + "</td>";

    // }
    html += "<tr>";
  }

  html += "</table> <button id='backprop'>submit</button>";


  this.inputDom.innerHTML = html;
  var oLayers =  this.net.outputLayerSize;
  var game = this;

  $("#backprop").click(function() {
    var input = $('input[name=checkboxes]:checked').val();
    var expected = [];
    for (var i = 0; i < oLayers; i++) {

      expected.push(input == i ? 1 : 0);

    }

    console.log([expected]);
    game.backpropagate([expected]);

  });


};


Game.prototype.drawCanvas = function () {

  var context = this.envDom.getContext('2d');

  for (var y = 0; y < this.height; y++) {
    var yy = y * this.size;
    for (var x = 0; x < this.width; x++) {
      var xx = x * this.size;
      // context.fillStyle = "#" + this.colors[this.board[y][x]];

      if (this.board.check(x, y) === 0) {
        context.strokeRect(xx, yy, this.size, this.size);
      } else {
        context.fillStyle = "black";
        context.fillRect(xx, yy, this.size, this.size);

      }

      if (this.mousePos !== 0 && x === this.mousePos.xx && y === this.mousePos.yy) {
        context.beginPath();
        context.arc(this.mousePos.xGrid + this.size / 2, this.mousePos.yGrid + this.size / 2, this.size / 3, 0, 2 * Math.PI);
        context.stroke();
      }
    }
  }
};


function writeMessage(canvas, message) {

  var context = canvas.getContext('2d');
  context.clearRect(5, 5, 400, 20);
  context.font = '10pt Calibri';
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

function Board(width, height) {

  this.width = width;
  this.height = height;
  this.board = [];
  this.convaluted = [];
  this.reset();
  // this.input = [[].concat.apply([], this.board)];
  this.input = this.convalute([[1, 1, 1], [1, 1, 1], [1, 1, 1]]);

}

Board.prototype.reset = function () {

  this.board = [];
  for (var y = 0; y < this.height; y++) {
    if (this.height > y) this.board.push([]);
    for (var x = 0; x < this.width; x++) {
      this.board[y].push(0);
    }
  }
};

Board.prototype.fill = function (x, y) {

  this.board[y][x] = 1;
};

Board.prototype.check = function (x, y) {

  // console.log(this.__proto__.constructor === Game);
  return this.board[y][x];
};

Board.prototype.convalute = function (weightsArray) {

  var height = this.board.length - weightsArray.length + 1;
  var width = this.board[0].length - weightsArray[0].length + 1;
  var weights = getBox(weightsArray, weightsArray.length, 0, 0);
  var box = [];

  this.convaluted = [];

  for (var y = 0; y < height; y++)
  {
    // if (height > y) this.convaluted.push([]);

    for (var x = 0; x < width; x++) {
      box = getBox(this.board, weightsArray.length, x, y);
      prod = dot_product(weights, box);
      this.convaluted.push(prod / 9);

    }
  }
  return [this.convaluted];
};

// 4 , 4 , 3
function ANN(board, input, hidden, output) {

  //Define Hyperparameters
  this.inputLayerSize = input;

  this.hiddenLayerSize = hidden;

  this.outputLayerSize = output;
  this.trainRate = .5;
  this.board = board;
  this.output = [];

}

ANN.prototype.init = function () {


//Weights (parameters)
  this.W1 = this.randn(this.inputLayerSize, this.hiddenLayerSize);
  this.W2 = this.randn(this.hiddenLayerSize, this.outputLayerSize);
  this.forward();
};

ANN.prototype.randn = function (h, w) {

  var arr = [];

  for (var y = 0; y < h; y++) {
    if (h > y) arr.push([]);

    for (var x = 0; x < w; x++) {

      arr[y][x] = Math.random();

    }
  }
  return arr;
};

ANN.prototype.load = function (str) {

  var obj = JSON.parse(str);

  this.W1 = obj.W1
  this.W2 = obj.W2


}

ANN.prototype.save = function () {

  var obj = {};

  obj.W1 = this.W1;
  obj.W2 = this.W2;

  return JSON.stringify(obj);



}
ANN.prototype.forward = function () {





  this.z2 = multiply_matrix(this.board.input, this.W1);

  // this.hidden = this.z2.map(function (x) {
  //   return sigmoid(x)
  // });
  this.hidden = op_matrix(this.z2, function(x){return sigmoid(x)});

  this.z3 = multiply_matrix(this.hidden, this.W2);

  this.output = op_matrix(this.z3, function(x){return sigmoid(x)});
  // this.output = this.z3.map(function (x) {
  //   return sigmoid(x)
  // });
};


ANN.prototype.costFunction = function (X, y) {
//Compute cost for given X,y, use weights already stored in class.
//   this.output = this.forward();
  // J = 0.5 * sum( (y - this.output) * * 2 );
  // return J;
};


function sigmoid(x) {
//Apply sigmoid activation f unction to scalar, vector, or matrix
  return 1 / (1 + Math.exp(-x));
}

function sigmoidPrime(x) {
// Gradient of sigmoid
  return Math.exp(-x) / Math.pow(1 + Math.exp(-x), 2);
}



function multiply_matrix(a, b) {
  var aNumRows = a.length,
    aNumCols = a[0].length,
    bNumRows = b.length,
    bNumCols = b[0].length,
    m = new Array(aNumRows);  // initialize array of rows

  if (aNumCols !== bNumRows) throw "Cannot multiply different size arrays";

  for (var r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row

    for (var c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;             // initialize the current cell

      for (var i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
}


//Addition
function add_matries(a, b) {

//Addition
  var new_matrix = [];
  for (var i = 0; i < a.length; i++) {
    new_matrix.push([]); // initialize the current row
    for (var j = 0; j < a[0].length; j++) {
      new_matrix[i].push(a[i][j] + b[i][j]);
    }
  }
  return new_matrix;
}

function sub_matries(a, b) {


//Subtraction
  var new_matrix = [];
  for (var i = 0; i < a.length; i++) {
    new_matrix.push([]); // initialize the current row
    for (var j = 0; j < a[0].length; j++) {
      new_matrix[i].push(a[i][j] - b[i][j]);
    }
  }
  return new_matrix;
}

function mul_matries(a, b) {


//Subtraction
  var new_matrix = [];
  for (var i = 0; i < a.length; i++) {
    new_matrix.push([]); // initialize the current row
    for (var j = 0; j < a[0].length; j++) {
      new_matrix[i].push(a[i][j] * b[i][j]);
    }
  }
  return new_matrix;
}



function op_matrix(a, c) {


//Subtraction
  var new_matrix = [];
  for (var i = 0; i < a.length; i++) {
    new_matrix.push([]); // initialize the current row
    for (var j = 0; j < a[0].length; j++) {
      new_matrix[i].push(c(a[i][j]));
    }
  }
  return new_matrix;
}



function getBox(board, size, x, y) {

  var values = [];

  for (var s = 0; s < size; s++) {

    values = values.concat(board[y + s].slice(x, x + size));
  }
  return values;
}

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

function dot_product(ary1, ary2) {
  if (ary1.length !== ary2.length)
    throw "can't find dot product: arrays have different lengths";
  var dotprod = 0;
  for (var i = 0; i < ary1.length; i++)
    dotprod += ary1[i] * ary2[i];
  return dotprod;
}

function array_sub(ary1, ary2) {
  if (ary1.length !== ary2.length)
    throw "can't array subtract: arrays have different lengths";
  var newArray = [];
  for (var i = 0; i < ary1.length; i++)
    newArray.push(ary1[i] - ary2[i]);

  return newArray;
}

function round(n, digits) {
  var x = Math.pow(10, digits);
  return Math.floor(n * x) / x;
}



function indexOfMax(arr) {
  if (arr.length === 0) {
    return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }

  return maxIndex;
}
