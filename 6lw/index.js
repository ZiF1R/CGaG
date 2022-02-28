import { CMatrix } from './node_modules/computer-graphics-utils/CMatrix.js';
import { CVector } from './node_modules/computer-graphics-utils/CVector.js';
import {
  CreateViewCoord, SpaceToWindow
} from "./node_modules/computer-graphics-utils/AdditionalOperations.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const func1 = (x, y) => Math.pow(x, 2) + Math.pow(y, 2);
const func2 = (x, y) => Math.pow(x, 2) - Math.pow(y, 2);
const func3 = (x, y) => Math.cos(x) - Math.sin(y);

/**
 * @param {Array<Array<number>>} area
 * @param {CMatrix} data matrix with data
 * @param {CVector} viewPoint coordinates of view point
 */
function GetProjection(area, data, viewPoint) {
  let z_max = data.Max(),
    z_min = data.Min();

  let MV = CreateViewCoord(
    viewPoint.Matrix[0][0],
    viewPoint.Matrix[1][0],
    viewPoint.Matrix[2][0],
  );

  let PS = new CMatrix(4, 4);
  PS.Matrix = [
    [area[0][0], area[0][0], area[1][0], area[1][0]],
    [area[0][1], area[1][1], area[0][1], area[1][1]],
    [z_max, z_max, z_max, z_max],
    [1, 1, 1, 1],
  ];

  let Q = MV.Multiply(PS);
  let V = Q.getRow(0);
  let x_min = Math.min(...V),
    x_max = Math.max(...V);

  V = Q.getRow(1);
  let y_max = Math.max(...V);

  PS.Matrix[2][0] =
    PS.Matrix[2][1] =
    PS.Matrix[2][2] =
    PS.Matrix[2][3] = z_min;

  Q = MV.Multiply(PS);
  V = Q.getRow(1);
  let y_min = Math.min(...V);

  return [
    [x_min, y_max],
    [x_max, y_min]
  ];
}

// MatrF === SurfacePointsMatrix
// MatrView === SurfaceProjectionMatrix
// MatrWindow === WindowMatrix
class CPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class CPlot3D {
  constructor(winArea = [[100, 100], [400, 400]]) {
    this.ViewPoint = new CVector(3);
    this.ViewPoint.Matrix = [[50], [30], [40]];
    this.ViewArea = [[-5, 5], [5, -5]];
    this.WindowArea = winArea;
    this.SurfacePointsMatrix = [];
    this.SurfaceProjectionMatrix = [];
    this.WindowMatrix = [];

    this.SetFunction(func1, 0.25, 0.25);
    this.Draw();
  }

  /**
   * @param {Function} fn 
   * @param {number} dx 
   * @param {number} dy 
   * @param {CMatrix} viewPoint 
   * @param {Array<Array<number>>} area 
   * @returns 
   */
  SetFunction(fn, dx, dy, area = [[-5, 5], [5, -5]]) {
    this.ActiveFunction = fn;
    this.ViewArea = area;
    this.SurfacePointsMatrix = [];
    this.SurfaceProjectionMatrix = [];
    this.WindowMatrix = [];

    this.CreateSurfacePointsMatrix(dx, dy);
    this.CreateSurfaceProjectionMatrix();
    this.CreateWindowMatrix();

    return this;
  }

  Rerender() {
    this.SurfaceProjectionMatrix = [];
    this.CreateSurfaceProjectionMatrix();
    this.WindowMatrix = [];
    this.CreateWindowMatrix();
    this.Draw();

    return this;
  }

  SetWinArea(dx, dy) {
    this.WindowArea = [[200, 50], [700, 550]];
    this.WindowArea[0][0] += dx;
    this.WindowArea[1][0] -= dx;

    this.WindowArea[0][1] += dy;
    this.WindowArea[1][1] -= dy;
  }

  /**
   * @param {number} r
   * @param {number} azimuth - from X axis
   * @param {number} angle - from Z axis
   */
  SetViewPoint(r, azimuth, angle) {
    this.ViewPoint.Matrix = [[r], [azimuth], [angle]];
    this.Rerender();

    return this;
  }

  CreateSurfacePointsMatrix(dx, dy) {
    let [[x_min, y_max], [x_max, y_min]] = this.ViewArea;

    for (let x = x_min; x <= x_max; x += dx) {
      let MatrixArray = [];
      for (let y = y_min; y <= y_max; y += dy) {
        let V = new CVector(4);
        V.Matrix = [[x], [y], [this.ActiveFunction(x, y)], [1]];
        MatrixArray.push(V);
      }
      this.SurfacePointsMatrix.push(MatrixArray);
    }
    return this;
  }

  CreateSurfaceProjectionMatrix() {
    let MV = CreateViewCoord(
      this.ViewPoint.Matrix[0][0],
      this.ViewPoint.Matrix[1][0],
      this.ViewPoint.Matrix[2][0]
    );

    let x_min = 9e15,
      y_min = x_min,
      x_max = -x_min,
      y_max = -x_min;

    for (let i = 0; i < this.SurfacePointsMatrix.length; i++) {
      let MatrixArray = [];
      for (let j = 0; j < this.SurfacePointsMatrix[i].length; j++) {
        let VX = this.SurfacePointsMatrix[i][j];
        VX = MV.Multiply(VX);

        let V = new CVector(3);
        V.Matrix = [
          [VX.Matrix[0][0]],
          [VX.Matrix[1][0]],
          [1]
        ];
        MatrixArray.push(V);

        let x = V.Matrix[0][0],
          y = V.Matrix[1][0];
        if (x < x_min) x_min = x; 
        if (x > x_max) x_max = x; 
        if (y < y_min) y_min = y; 
        if (y > y_max) y_max = y; 
      }
      this.SurfaceProjectionMatrix.push(MatrixArray);
    }

    this.ViewArea = [[x_min, y_max], [x_max, y_min]];
    return this;
  }

  CreateWindowMatrix() {
    let MV = SpaceToWindow(this.ViewArea, this.WindowArea);

    for (let i = 0; i < this.SurfaceProjectionMatrix.length; i++) {
      let PointsArray = [];
      for (let j = 0; j < this.SurfaceProjectionMatrix[i].length; j++) {
        let V = this.SurfaceProjectionMatrix[i][j];
        V = MV.Multiply(V);
        let newPoint = new CPoint(V.Matrix[0][0], V.Matrix[1][0]);
        PointsArray.push(newPoint);
      }
      this.WindowMatrix.push(PointsArray);
    }

    return this;
  }

  Draw() {
    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < this.WindowMatrix.length - 1; i++) {
      for (let j = 0; j < this.WindowMatrix[i].length - 1; j++) {
        let points = [
          this.WindowMatrix[i][j],
          this.WindowMatrix[i][j + 1],
          this.WindowMatrix[i + 1][j + 1],
          this.WindowMatrix[i + 1][j]
        ];
          
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.lineTo(points[3].x, points[3].y);
        ctx.lineTo(points[0].x, points[0].y);
      }
    }

    ctx.lineWidth = "1";
    ctx.strokeStyle = "#000";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();

    return this;
  }
}

let plot = new CPlot3D([[200, 50], [700, 550]]);

document.getElementById("f1").addEventListener("click", (e) => {
  plot.SetFunction(func1, 0.25, 0.25);
  plot.Draw();
});
document.getElementById("f2").addEventListener("click", (e) => {
  plot.SetFunction(func2, 0.25, 0.25);
  plot.Draw();
});
document.getElementById("f3").addEventListener("click", (e) => {
  plot.SetFunction(func3, 0.25, 0.25);
  plot.Draw();
});

const viewDistance = document.getElementById("view-distance");
viewDistance.addEventListener("input", (e) => {
  plot.SetWinArea(+e.target.value, +e.target.value);
  plot.SetViewPoint(
    plot.ViewPoint.Matrix[0][0],
    plot.ViewPoint.Matrix[1][0],
    plot.ViewPoint.Matrix[2][0]
  );
})


let newViewPoint = new CVector(3);
let lastViewPoint = {};
function rotatePlot(e) {
  let x = lastViewPoint.matrix[1][0] + (clickCoordinates.x - e.clientX);
  let y = lastViewPoint.matrix[2][0] + (clickCoordinates.y - e.clientY);

  x %= 360;
  y %= 360;

  newViewPoint.Matrix = [[lastViewPoint.matrix[0][0]], [x], [y]];
  plot.SetViewPoint(
    newViewPoint.Matrix[0][0],
    newViewPoint.Matrix[1][0],
    newViewPoint.Matrix[2][0]
  );
}

let clickCoordinates = {};
canvas.addEventListener("mousedown", (e) => {
  clickCoordinates = { x: e.clientX, y: e.clientY};
  lastViewPoint = JSON.parse(JSON.stringify(plot.ViewPoint));
  newViewPoint.Matrix = lastViewPoint.matrix;

  canvas.addEventListener("mousemove", rotatePlot);
  canvas.addEventListener("mouseup", mouseUp);

  function mouseUp() {
    plot.SetViewPoint(
      newViewPoint.Matrix[0][0],
      newViewPoint.Matrix[1][0],
      newViewPoint.Matrix[2][0]
    );
    canvas.removeEventListener("mousemove", rotatePlot);
    canvas.removeEventListener("mouseup", mouseUp);
  }
});