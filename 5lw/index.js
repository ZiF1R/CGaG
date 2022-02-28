import { CMatrix } from "./node_modules/cmatrix-cvector/CMatrix.js";
import { CVector } from "./node_modules/cmatrix-cvector/CVector.js";
import { ScalarMult, VectorMult } from "./node_modules/cmatrix-cvector/AdditionalOperations.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

class CPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class CPyramid {
  constructor() {
    this.Vertexes = new CMatrix(4, 6);

    // Default coordinates for pyramid vertexes.
    // First row contains x coordinates,
    // in second - y coordinates,
    // in third - z coordinates,
    // e.g. point A -> first column => (6, 0, 0)
    this.Vertexes.Matrix = [
      [6, 0, -6, 2, 0, -2],
      [0, -6, 0, 0, -2, 0],
      [0, 0, 0, 6, 6, 6],
      [0, 0, 0, 0, 0, 0]
    ];

    this.WinArea = [[150, 50], [600, 500]];
    this.SetDrawMode(this.DrawWithInvisibleLines);
    this.CurrentDrawModeFunction(new CVector(3));
  }

  SetWinArea(dx, dy) {
    this.WinArea = [[150, 50], [600, 500]];
    this.WinArea[0][0] += dx;
    this.WinArea[1][0] -= dx;

    this.WinArea[0][1] += dy;
    this.WinArea[1][1] -= dy;
  }

  CalculatePointsCoordinates(viewPoint) {
    let VM = CreateViewCoord(
      viewPoint.Matrix[0][0],
      viewPoint.Matrix[1][0],
      viewPoint.Matrix[2][0],
    );

    let viewVertexes = VM.Multiply(this.Vertexes);

    let y_max = Math.max(...viewVertexes.Matrix[1]),
      y_min = Math.min(...viewVertexes.Matrix[1]),
      x_max = Math.max(...viewVertexes.Matrix[0]),
      x_min = Math.min(...viewVertexes.Matrix[0]);

    let MW = SpaceToWindow(
      [[x_min, y_min], [x_max, y_max]],
      this.WinArea
    );

    // go through the vertexes
    let temp = new CVector(3);
    let points = [];
    for (let i = 0; i < this.Vertexes.Matrix[0].length; i++) {
      temp.Matrix = [
        [viewVertexes.Matrix[0][i]],
        [viewVertexes.Matrix[1][i]],
        [1]
      ];
      temp = MW.Multiply(temp);
      points.push(new CPoint(temp.Matrix[0][0], temp.Matrix[1][0]));
    }

    return points;
  }

  /**
   * @param {CMatrix} viewPoint contains (x, y, z) coordinates in decart coordinate system
   */
  DrawWithInvisibleLines(viewPoint) {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let points = this.CalculatePointsCoordinates(viewPoint);

    // draw the pyramid
    ctx.moveTo(points[2].x, points[2].y);
    for (let i = 0; i < 3; i++)
      ctx.lineTo(points[i].x, points[i].y);

    ctx.moveTo(points[5].x, points[5].y);
    for (let i = 3; i < 6; i++)
      ctx.lineTo(points[i].x, points[i].y);
    
    for (let i = 0; i < 3; i++){
      ctx.moveTo(points[i].x, points[i].y);
      ctx.lineTo(points[i + 3].x, points[i + 3].y);
    }

    ctx.lineWidth = "1";
    ctx.strokeStyle = "#000";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();
  }

  /**
   * @param {CMatrix} viewPoint contains (x, y, z) coordinates in decart coordinate system
   */
  DrawWithoutInvisibleLines(viewPoint) {
    let ViewDecart = SphereToDecart(viewPoint);
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let points = this.CalculatePointsCoordinates(viewPoint);
    
    let R1 = new CVector(3),
      R2 = new CVector(3);
    for (let i = 0; i < 3; i++) {
      let VE = new CVector(3);
      VE.Matrix = [
        [this.Vertexes.Matrix[0][i + 3]],
        [this.Vertexes.Matrix[1][i + 3]],
        [this.Vertexes.Matrix[2][i + 3]],
      ];

      let k = i === 2 ? 0 : i + 1;

      R1.Matrix = [
        [this.Vertexes.Matrix[0][i]],
        [this.Vertexes.Matrix[1][i]],
        [this.Vertexes.Matrix[2][i]],
      ];
      R2.Matrix = [
        [this.Vertexes.Matrix[0][k]],
        [this.Vertexes.Matrix[1][k]],
        [this.Vertexes.Matrix[2][k]],
      ];

      let V1 = R2.Subtract(R1);
      let V2 = VE.Subtract(R1);

      let VN = VectorMult(V2, V1);

      if (ScalarMult(VN, ViewDecart) >= 0) {
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[k].x, points[k].y);
        ctx.lineTo(points[k + 3].x, points[k + 3].y);
        ctx.lineTo(points[i + 3].x, points[i + 3].y);
        ctx.lineTo(points[i].x, points[i].y);
      }
    }

    if (ViewDecart.Matrix[2][0] >= 0) {
      ctx.moveTo(points[5].x, points[5].y);
      for (let i = 3; i < 6; i++)
        ctx.lineTo(points[i].x, points[i].y);
    } else {
      ctx.moveTo(points[2].x, points[2].y);
      for (let i = 0; i < 3; i++)
        ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.lineWidth = "1";
    ctx.strokeStyle = "#000";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();
  }

  SetDrawMode(fn) {
    if (
      fn !== this.DrawWithInvisibleLines &&
      fn !== this.DrawWithoutInvisibleLines
    ) throw new Error();

    this.CurrentDrawModeFunction = (...args) => fn.call(this, ...args);
  }
}

/**
 * @param {Array<Array<number>>} areaInWorldCoordinates two dimentional array, contains coordinates of top left and bottom right corners
 * @param {Array<Array<number>>} areaInWindowCoordinates two dimentional array, contains coordinates of top left and bottom right corners
 */
function SpaceToWindow(areaInWorldCoordinates, areaInWindowCoordinates) {
  let [x_min, y_min] = areaInWorldCoordinates[0];
  let [x_max, y_max] = areaInWorldCoordinates[1];

  let dXw = areaInWindowCoordinates[1][0] - areaInWindowCoordinates[0][0],
    dYw = areaInWindowCoordinates[1][1] - areaInWindowCoordinates[0][1],
    dX = x_max - x_min,
    dY = y_max - y_min;

  let Kx = dXw / dX,
    Ky = dYw / dY;

  let Tsw = new CMatrix(3, 3);
  Tsw.Matrix = [
    [Kx, 0, areaInWindowCoordinates[0][0] - Kx * x_min],
    [0, -Ky, areaInWindowCoordinates[1][1] + Ky * y_min],
    [0, 0, 1],
  ];

  return Tsw;
}

const pyramid = new CPyramid();
let viewPoint = new CVector(3);
viewPoint.Matrix = [[10], [0], [0]];
pyramid.SetDrawMode(pyramid.DrawWithInvisibleLines, viewPoint);

let newViewPoint = new CVector(3);
function rotatePyramid(e) {
  let x = viewPoint.Matrix[1][0] + (clickCoordinates.x - e.clientX);
  let y = viewPoint.Matrix[2][0] + (clickCoordinates.y - e.clientY);

  x %= 360;
  y %= 360;

  newViewPoint.Matrix = [[10], [x], [y]];
  pyramid.CurrentDrawModeFunction(newViewPoint);
}

let clickCoordinates = {};
canvas.addEventListener("mousedown", (e) => {
  clickCoordinates = { x: e.clientX, y: e.clientY};

  canvas.addEventListener("mousemove", rotatePyramid);
  canvas.addEventListener("mouseup", mouseUp);

  function mouseUp() {
    viewPoint.Matrix = newViewPoint.Matrix;
    canvas.removeEventListener("mousemove", rotatePyramid);
    canvas.removeEventListener("mouseup", mouseUp);
  }
});

const viewDistance = document.getElementById("view-distance");
viewDistance.addEventListener("input", (e) => {
  pyramid.SetWinArea(+e.target.value, +e.target.value);
  pyramid.CurrentDrawModeFunction(viewPoint);
})

const drawModeCheckbox = document.getElementById("draw-mode");
drawModeCheckbox.addEventListener("change", (e) => {
  if (e.target.checked)
    pyramid.SetDrawMode(pyramid.DrawWithoutInvisibleLines);
  else
    pyramid.SetDrawMode(pyramid.DrawWithInvisibleLines);

  pyramid.CurrentDrawModeFunction(viewPoint);
});

/**
 * @param {number} r
 * @param {number} azimuth - from X axis
 * @param {number} angle - from Z axis
 */
function CreateViewCoord(r, azimuth, angle) {
  let fg = azimuth % 360.0;
  let azimuthInRadians = (fg / 180.0) * Math.PI;

  fg = angle % 360.0;
  let angleInRadians = (fg / 180.0) * Math.PI;

  let VM = new CMatrix(4, 4);
  VM.Matrix = [
    [-Math.sin(azimuthInRadians), Math.cos(azimuthInRadians), 0, 0],
    [-Math.cos(angleInRadians) * Math.cos(azimuthInRadians), -Math.cos(angleInRadians) * Math.sin(azimuthInRadians), Math.sin(angleInRadians), 0],
    [-Math.sin(angleInRadians) * Math.cos(azimuthInRadians), -Math.sin(angleInRadians) * Math.sin(azimuthInRadians), -Math.cos(angleInRadians), r],
    [0, 0, 0, 1],
  ];

  return VM;
}

/**
 * @param {CMatrix} viewPoint contains (x, y, z) coordinates in decart coordinate system
 */
function SphereToDecart(viewPoint) {
  let r = viewPoint.Matrix[0][0],
    azimuth = viewPoint.Matrix[1][0],
    angle = viewPoint.Matrix[2][0];

  let azimuthInRadians = (azimuth / 180.0) * Math.PI,
    angleInRadians = (angle / 180.0) * Math.PI;

  let viewPointInDecart = new CVector(3);
  viewPointInDecart.Matrix = [
    [r * Math.sin(angleInRadians) * Math.cos(azimuthInRadians)], // x coordinate of view point
    [r * Math.sin(angleInRadians) * Math.sin(azimuthInRadians)], // y coordinate of view point
    [r * Math.cos(angleInRadians)] // z coordinate of view point
  ];

  return viewPointInDecart;
}