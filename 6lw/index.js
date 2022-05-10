import { CMatrix } from './node_modules/computer-graphics-utils/CMatrix.js';
import { CVector } from './node_modules/computer-graphics-utils/CVector.js';
import {
  CreateViewCoord, SpaceToWindow
} from "./node_modules/computer-graphics-utils/AdditionalOperations.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// функции для построения поверхностей
const func1 = (x, y) => Math.exp(x) - Math.exp(y);
const func2 = (x, y) => Math.sqrt(x**2 + y**2) + 3 * Math.cos(Math.sqrt(x**2 + y**2)) + 5;
const func3 = (x, y) => (x**3 * y - y**3 * x) / 40;
// const func11 = (x, y) => Math.pow(x, 2) + Math.pow(y, 2);
// const func22 = (x, y) => Math.pow(x, 2) - Math.pow(y, 2);
// const func33 = (x, y) => Math.cos(x) - Math.sin(y);

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
    this.ViewPoint.Matrix = [[50], [30], [40]]; // координаты точки наблюдения
    this.ViewArea = [[-5, 5], [5, -5]]; // область в мировых координатах
    this.WindowArea = winArea; // область в оконных координатах
    this.SurfacePointsMatrix = []; // точки поверхности
    this.SurfaceProjectionMatrix = []; // точки проекции поверхности
    this.WindowMatrix = []; // точки поверхности в оконных координатах

    // устанавливаем функцию поверхности по умалчанию и рисуем ее
    this.SetFunction(func1, 0.25, 0.25);
    this.Draw();
  }

  /**
   * @param {Function} fn - новая функция для описания поверхности
   * @param {number} dx - приращение координаты х
   * @param {number} dy  - приращение координаты у
   * @param {CMatrix} viewPoint - точка наблюдения
   * @param {Array<Array<number>>} area - область в мировых координатах
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

  // функция перерисовки
  Rerender() {
    this.SurfaceProjectionMatrix = [];
    this.CreateSurfaceProjectionMatrix();
    this.WindowMatrix = [];
    this.CreateWindowMatrix();
    this.Draw();

    return this;
  }

  // задает новые размеры области при масштабировании поверхности
  SetWinArea(dx, dy) {
    this.WindowArea = [[200, 50], [700, 550]];
    this.WindowArea[0][0] += dx;
    this.WindowArea[1][0] -= dx;

    this.WindowArea[0][1] += dy;
    this.WindowArea[1][1] -= dy;
  }

  /**
   * @param {number} r - distance from start of coordinates
   * @param {number} azimuth - from X axis
   * @param {number} angle - from Z axis
   * устанавливает новые координаты точки наблюдения
   */
  SetViewPoint(r, azimuth, angle) {
    this.ViewPoint.Matrix = [[r], [azimuth], [angle]];
    this.Rerender();

    return this;
  }

  // создает точки поверхности
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

  // создает точки проекции поверхности
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

  // точки поверхности в оконных координатах
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

  // отображает поверхность
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

    ctx.fillStyle = "white";
    ctx.fill();
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

// обработчики для изменения функции поверхности
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

// обработчик для изменения масштаба отображения
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
// функция для поворота поверхности
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

// обработчик для поворота поверхности с помощью мыши
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