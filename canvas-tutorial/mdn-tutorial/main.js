var canvas = document.getElementById('tutorial');
var ctx = canvas.getContext('2d');

//* * Rectangles
// ctx.fillRect(25, 25, 100, 100);
// ctx.clearRect(45, 45, 60, 60);
// ctx.strokeRect(50, 50, 50, 50);

//* * Path
// ctx.beginPath(); // initialize
// ctx.moveTo(75, 50); // place the starting point
// ctx.lineTo(100, 75);
// ctx.lineTo(100, 25);
// ctx.fill();

// ctx.beginPath();
// ctx.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
// ctx.moveTo(110, 75);
// ctx.arc(75, 75, 35, 0, Math.PI, false); // Mouth (clockwise)
// ctx.moveTo(65, 65);
// ctx.arc(60, 65, 5, 0, Math.PI * 2, true); // Left eye
// ctx.moveTo(95, 65);
// ctx.arc(90, 65, 5, 0, Math.PI * 2, true); // Right eye
// ctx.stroke();

// ctx.beginPath();
// ctx.moveTo(25, 25);
// ctx.lineTo(105, 25);
// ctx.lineTo(25, 105);
// ctx.fill();

// ctx.beginPath();
// ctx.moveTo(125, 125);
// ctx.lineTo(125, 45);
// ctx.lineTo(45, 125);
// ctx.closePath();
// ctx.stroke();

// for (var i = 0; i < 4; i++) {
//   for (var j = 0; j < 3; j++) {
//     ctx.beginPath();
//     var x = 25 + j * 50;
//     var y = 25 + i * 50;
//     var radius = 20;
//     var startAngle = 0;
//     var endAngle = Math.PI + (Math.PI * j) / 2;
//     var anticlockwise = i % 2 !== 0;

//     ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);

//     if (i > 1) {
//       ctx.fill();
//     } else {
//       ctx.stroke();
//     }
//   }
// }

//* * Curve
// ctx.beginPath();
// ctx.moveTo(75, 25);
// ctx.quadraticCurveTo(25, 25, 25, 62.5);
// ctx.quadraticCurveTo(25, 100, 50, 100);
// ctx.quadraticCurveTo(50, 120, 30, 125);
// ctx.quadraticCurveTo(60, 120, 65, 100);
// ctx.quadraticCurveTo(125, 100, 125, 62.5);
// ctx.quadraticCurveTo(125, 25, 75, 25);
// ctx.stroke();

// ctx.beginPath();
// ctx.moveTo(75, 40);
// ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
// ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
// ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
// ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
// ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
// ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
// ctx.fill();

//* * Arcade game
// function roundedRect(ctx, x, y, width, height, radius) {
//   ctx.beginPath();
//   ctx.moveTo(x, y + radius);
//   ctx.lineTo(x, y + height - radius);
//   ctx.arcTo(x, y + height, x + radius, y + height, radius);
//   ctx.lineTo(x + width - radius, y + height);
//   ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
//   ctx.lineTo(x + width, y + radius);
//   ctx.arcTo(x + width, y, x + width - radius, y, radius);
//   ctx.lineTo(x + radius, y);
//   ctx.arcTo(x, y, x, y + radius, radius);
//   ctx.stroke();
// }

// roundedRect(ctx, 12, 12, 150, 150, 15);
// roundedRect(ctx, 19, 19, 150, 150, 9);
// roundedRect(ctx, 53, 53, 49, 33, 10);
// roundedRect(ctx, 53, 119, 49, 16, 6);
// roundedRect(ctx, 135, 53, 49, 33, 10);
// roundedRect(ctx, 135, 119, 25, 49, 10);

// ctx.beginPath();
// ctx.arc(37, 37, 13, Math.PI / 7, -Math.PI / 7, false);
// ctx.lineTo(32, 37);
// ctx.fill();

// for (var i = 0; i < 8; i++) {
//   ctx.fillRect(51 + i * 16, 35, 4, 4);
// }

// for (i = 0; i < 6; i++) {
//   ctx.fillRect(115, 51 + i * 16, 4, 4);
// }

// for (i = 0; i < 8; i++) {
//   ctx.fillRect(51 + i * 16, 99, 4, 4);
// }

// ctx.beginPath();
// ctx.moveTo(83, 116);
// ctx.lineTo(83, 102);
// ctx.bezierCurveTo(83, 94, 89, 88, 97, 88);
// ctx.bezierCurveTo(105, 88, 111, 94, 111, 102);
// ctx.lineTo(111, 116);
// ctx.lineTo(106.333, 111.333);
// ctx.lineTo(101.666, 116);
// ctx.lineTo(97, 111.333);
// ctx.lineTo(92.333, 116);
// ctx.lineTo(87.666, 111.333);
// ctx.lineTo(83, 116);
// ctx.stroke();
// ctx.fill();

// ctx.strokeStyle = 'white';
// ctx.fillStyle = 'white';
// ctx.beginPath();
// ctx.moveTo(91, 96);
// ctx.bezierCurveTo(88, 96, 87, 99, 87, 101);
// ctx.bezierCurveTo(87, 103, 88, 106, 91, 106);
// ctx.bezierCurveTo(94, 106, 95, 103, 95, 101);
// ctx.bezierCurveTo(95, 99, 94, 96, 91, 96);
// ctx.moveTo(103, 96);
// ctx.bezierCurveTo(100, 96, 99, 99, 99, 101);
// ctx.bezierCurveTo(99, 103, 100, 106, 103, 106);
// ctx.bezierCurveTo(106, 106, 107, 103, 107, 101);
// ctx.bezierCurveTo(107, 99, 106, 96, 103, 96);
// ctx.stroke();
// ctx.fill();

// ctx.fillStyle = 'black';
// ctx.beginPath();
// ctx.arc(101, 102, 2, 0, Math.PI * 2, true);
// ctx.fill();
// ctx.beginPath();
// ctx.arc(89, 102, 2, 0, Math.PI * 2, true);
// ctx.fill();

//* * Path2D
// var rectangle = new Path2D();
// rectangle.rect(10, 10, 50, 50);

// var circle = new Path2D();
// circle.moveTo(125, 35);
// circle.arc(100, 35, 25, 0, 2 * Math.PI);

// ctx.stroke(rectangle);
// ctx.fill(circle);

//* * fillStyle
// for (var i = 0; i < 6; i++) {
//   for (var j = 0; j < 6; j++) {
//     ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ', ' +
//       Math.floor(255 - 42.5 * j) + ', 0)';
//     ctx.fillRect(j * 25, i * 25, 25, 25);
//   }
// }

//* * strokeStyle
// for (var i = 0; i < 6; i++) {
//   for (var j = 0; j < 6; j++) {
//     ctx.strokeStyle = 'rgb(0, ' + Math.floor(255 - 42.5 * i) + ', ' +
//       Math.floor(255 - 42.5 * j) + ')';
//     ctx.beginPath();
//     ctx.arc(12.5 + j * 25, 12.5 + i * 25, 10, 0, Math.PI * 2, true);
//     ctx.stroke();
//   }
// }

//* * Transparency
// // draw background
// ctx.fillStyle = '#FD0';
// ctx.fillRect(0, 0, 75, 75);
// ctx.fillStyle = '#6C0';
// ctx.fillRect(75, 0, 75, 75);
// ctx.fillStyle = '#09F';
// ctx.fillRect(0, 75, 75, 75);
// ctx.fillStyle = '#F30';
// ctx.fillRect(75, 75, 75, 75);
// ctx.fillStyle = '#FFF';

// // set transparency value
// ctx.globalAlpha = 0.2;

// // Draw semi transparent circles
// for (var i = 0; i < 7; i++) {
//   ctx.beginPath();
//   ctx.arc(75, 75, 10 + 10 * i, 0, Math.PI * 2, true);
//   ctx.fill();
// }

//* * line cap
// var lineCap = ['butt', 'round', 'square'];

// // Draw guides
// ctx.strokeStyle = '#09f';
// ctx.beginPath();
// ctx.moveTo(10, 10);
// ctx.lineTo(140, 10);
// ctx.moveTo(10, 140);
// ctx.lineTo(140, 140);
// ctx.stroke();

// // Draw lines
// ctx.strokeStyle = 'black';
// for (var i = 0; i < lineCap.length; i++) {
//   ctx.lineWidth = 15;
//   ctx.lineCap = lineCap[i];
//   ctx.beginPath();
//   ctx.moveTo(25 + i * 50, 10);
//   ctx.lineTo(25 + i * 50, 140);
//   ctx.stroke();
// }

//* * line join
// var lineJoin = ['round', 'bevel', 'miter'];
// ctx.lineWidth = 10;
// for (var i = 0; i < lineJoin.length; i++) {
//   ctx.lineJoin = lineJoin[i];
//   ctx.beginPath();
//   ctx.moveTo(-5, 5 + i * 40);
//   ctx.lineTo(35, 45 + i * 40);
//   ctx.lineTo(75, 5 + i * 40);
//   ctx.lineTo(115, 45 + i * 40);
//   ctx.lineTo(155, 5 + i * 40);
//   ctx.stroke();
// }
