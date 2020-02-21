/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 *  Splash bubbles
 *  Copyright © 85times.com
 */
$(function () {

  var canvas = $('#bubbles');
  var context = canvas.get(0).getContext("2d");

  var bubbles = [];
  var bubblesNum = 75;

  var minRadius = 3;
  var maxRadius = 50;
  var minMove = 5;
  var maxMove = 8;

  for (var i = 0; i < bubblesNum; i++) {
    bubbles[i] = {
      xcoord: getRandomNum(Math.ceil(canvas.width() * 0.2), Math.ceil(canvas.width() * 0.8)),
      ycoord: getRandomNum(0, canvas.height()),
      radius: getRandomNum(minRadius, maxRadius),
      move: getRandomNum(minMove, maxMove),
    }
  }

  setInterval(function () {
    context.clearRect(0, 0, canvas.width(), canvas.height());

    for (var i = 0; i < bubbles.length; i++) {
      bubbles[i].ycoord -= bubbles[i].move;

      if (bubbles[i].ycoord < (0 - maxRadius)) {
        bubbles[i].xcoord = getRandomNum(Math.ceil(canvas.width() * 0.2), Math.ceil(canvas.width() * 0.8));
        bubbles[i].ycoord = canvas.height() + maxRadius;
        bubbles[i].radius = getRandomNum(minRadius, maxRadius);
        bubbles[i].move = getRandomNum(minMove, maxMove);
      }

      context.beginPath();
      context.arc(bubbles[i].xcoord, bubbles[i].ycoord, bubbles[i].radius, 0, Math.PI * 2, false);
      context.fillStyle = "rgba(127, 138, 153, 0.1)";
      context.fill();
      context.closePath();
    }
  }, 1000 / 33);

});

/**
 *  Get Random Integer
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 *  Get Random Number
 */
function getRandomNum(min, max) {
  return (Math.random() * (max - min + 1)) + min;
}
