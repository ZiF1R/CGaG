import { CMatrix } from "./types/CMatrix.js";
import { CVector } from "./types/CVector.js";

// coordinates of figure points in world coordinate system
const A = [-2, -4],
  B = [-3, 0],
  C = [0, 4],
  D = [3, 0],
  E = [2, -4],
  F = [-2, 0],
  G = [2, 0];

let points = [ A, B, C, D, E, F, G ];

// coordinates of area in window coordinate system
const TopLeftCorner = [100, 200],
  BottomRightCorner = [400, 500];


let Zx = new CVector(points.length),
  Zy = new CVector(points.length);

points.forEach(
  (point, i) => {
    Zx.Matrix[i] = [point[0]];
    Zy.Matrix[i] = [point[1]];
  }
);

let X_min = Zx.Min(),
  X_max = Zx.Max(),
  Y_min = Zy.Min(),
  Y_max = Zy.Max();

let dXw = BottomRightCorner[0] - TopLeftCorner[0],
  dYw = BottomRightCorner[1] - TopLeftCorner[1],
  dX = X_max - X_min,
  dY = Y_max - Y_min;

let Kx = dXw / dX,
  Ky = dYw / dY;

let Tsw = new CMatrix(3, 3);
Tsw.Matrix = [
  [Kx, 0, TopLeftCorner[0] - Kx * X_min],
  [0, -Ky, BottomRightCorner[1] + Ky * Y_min],
  [0, 0, 1],
];

let A_vector = getPointVector(A),
  B_vector = getPointVector(B),
  C_vector = getPointVector(C),
  D_vector = getPointVector(D),
  E_vector = getPointVector(E),
  F_vector = getPointVector(F),
  G_vector = getPointVector(G);

function getPointVector(point) {
  let result = new CVector(3);
  result.Matrix = [
    [point[0]],
    [point[1]],
    [1]
  ];
  result = Tsw.Multiply(result).transpose();

  return result.Matrix[0];
}


// draw figures

let canvas = document.getElementById("window-coordinate-system");
let ctx = canvas.getContext("2d");

let figurePoints = [
  B_vector,
  C_vector,
  D_vector,
  B_vector,
  F_vector,
  A_vector,
  E_vector,
  G_vector,
  D_vector,
];
const xPadding = 50,
  yPadding = 40;

const graphLeft = xPadding,
  graphRigh = canvas.width - xPadding,
  graphTop = yPadding,
  graphBottom = canvas.height - yPadding;


///
/// draw figure in window coordinate system
///

let minMax = getMinMaxCoordinates(figurePoints);
ctx.font = '16px Raleway';
ctx.textAlign = 'right';
ctx.textBaseline = 'middle';

// x axis markers
ctx.fillText(0, graphLeft, graphTop - 15);
ctx.fillText(minMax.x.min, minMax.x.min + graphLeft, graphTop - 15);
ctx.fillText(minMax.x.max, minMax.x.max + graphLeft, graphTop - 15);

// y axis markers
ctx.fillText(0, graphLeft - 10, graphTop);
ctx.fillText(minMax.y.max, graphLeft - 10, minMax.y.max + graphTop);
ctx.fillText(minMax.y.min, graphLeft - 10, minMax.y.min + graphTop);

// draw axis
ctx.moveTo(graphRigh, graphTop);
ctx.lineTo(graphLeft, graphTop);
ctx.lineTo(graphLeft, graphBottom);

ctx.lineWidth = '2';
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.stroke();

// draw figure
ctx.beginPath();

drawFigure(figurePoints);

ctx.strokeStyle = "tomato";
ctx.closePath();

ctx.stroke();


///
/// draw figure in world coordinate system
///

canvas = document.getElementById("world-coordinate-system");
ctx = canvas.getContext("2d");
ctx.font = '16px Raleway';
ctx.textAlign = 'right';
ctx.textBaseline = 'middle';

minMax = getMinMaxCoordinates(points);

const center = {
  x: canvas.width / 2.0,
  y: canvas.height / 2.0,
};

// Coefficient for scaling the chart,
// because the coordinates of figure
// in world coordinate system is very small,
// so we increase it
const coefficient = 45;

// get x and y coordinate in world coordinate system chart
const getXInWCS = (x) => center.x + x * coefficient;
const getYInWCS = (y) => center.y - y * coefficient;

// x axis markers
ctx.fillText(0, center.x - 10, center.y + 15);
ctx.fillText(minMax.x.min, getXInWCS(minMax.x.min), center.y + 15);
ctx.fillText(minMax.x.max, getXInWCS(minMax.x.max), center.y + 15);

// y axis markers
ctx.fillText(minMax.y.max, center.x - 10, getYInWCS(minMax.y.max));
ctx.fillText(minMax.y.min, center.x - 10, getYInWCS(minMax.y.min));

// draw axis
ctx.moveTo(center.x, graphTop);
ctx.lineTo(center.x, graphBottom);
ctx.moveTo(graphLeft, center.y);
ctx.lineTo(graphRigh, center.y);


ctx.lineWidth = '2';
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.stroke();

figurePoints = [ B, C, D, B, F, A, E, G, D ];

ctx.beginPath();
// draw figure in world coordinate system
for (let i = 0; i < figurePoints.length - 1; i++) {
  ctx.moveTo(getXInWCS(figurePoints[i][0]), getYInWCS(figurePoints[i][1]));
  ctx.lineTo(getXInWCS(figurePoints[i + 1][0]), getYInWCS(figurePoints[i + 1][1]));
}
ctx.strokeStyle = "tomato";
ctx.closePath();

ctx.stroke();


///
/// functions-helpers
///

/**
 * @param {Array} points
 */
function drawFigure(points) {
  for (let i = 0; i < points.length - 1; i++) {
    ctx.moveTo(points[i][0] + graphLeft, points[i][1] + graphTop);
    ctx.lineTo(points[i + 1][0] + graphLeft, points[i + 1][1] + graphTop);
  }
}

/**
 * @param {Array} coordinates
 * @returns {Object}
 */
function getMinMaxCoordinates(coordinates) {
  let result = {
    x: {
      max: -99999,
      min: 99999,
    },
    y: {
      max: -99999,
      min: 99999,
    },
  };

  for (let i = 0; i < coordinates.length; i++) {
    // find min and max of x coordinate
    if (coordinates[i][0] > result.x.max)
      result.x.max = coordinates[i][0];
    if (coordinates[i][0] < result.x.min)
      result.x.min = coordinates[i][0];

    // find min and max of y coordinate
    if (coordinates[i][1] > result.y.max)
      result.y.max = coordinates[i][1];
    if (coordinates[i][1] < result.y.min)
      result.y.min = coordinates[i][1];
  }

  return result;
}
