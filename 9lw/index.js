import { CMatrix } from './node_modules/computer-graphics-utils/CMatrix.js';
import { CVector } from './node_modules/computer-graphics-utils/CVector.js';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/**
 * @param {CVector} X 
 * @param {CVector} Y 
 * @param {number} x 
 * @param {number} size 
 */
function Lagrange(X, Y, x, size) {
  let lagrange_pol = 0,
    basic_pol;

  for (let i = 1; i < size; i++) {
    basic_pol = 1;
    for (let j = 1; j < size; j++) {
      if (j === i)
        continue;
      basic_pol *= (x - X.Matrix[j][0]) / (X.Matrix[i][0] - X.Matrix[j][0]);
    }
    lagrange_pol += basic_pol * Y.Matrix[i][0];
  }

  return lagrange_pol;
}

class CPlot2D {
  constructor() {
    this.X = new CVector(5);
    this.Y = new CVector(5);
    this.K = new CMatrix(3, 3);
    this.WinArea = [[100, 100], [500, 500]];
    this.WorldArea = [[0, 0], [5, 5]];

    this.OnLagrange();
    this.Draw();
    this.DrawLagrange();
  }

  /**
   * @param {CVector} XX 
   * @param {CVector} YY 
   * @param {Array<Array<number>>} winArea 
   */
  SetParams(XX, YY, winArea) {
    this.X.changeSize(XX.Rows, this.X.Columns);
    this.Y.changeSize(YY.Rows, this.Y.Columns);

    this.X = XX;
    this.Y = YY;

    let x_min = this.X.Min(),
      x_max = this.X.Max(),
      y_min = this.Y.Min(),
      y_max = this.Y.Max();

    this.WorldArea = [[x_min, y_max], [x_max, y_min]];
    this.WinArea = winArea;
    this.K = SpaceToWindow(this.WorldArea, this.WinArea);
  }

  /**
   * @param {number} xInWorld 
   * @param {number} yInWorld 
   * @returns x and y in window coordinates
   */
  GetWindowCoordinates(xInWorld, yInWorld) {
    let V = new CVector(3);
    V.Matrix = [
      [xInWorld],
      [yInWorld],
      [1]
    ];

    let W = this.K.Multiply(V);
    return [W.Matrix[0][0], W.Matrix[1][0]];
  }

  Draw() {
    let xInWorld = this.X.Matrix[0][0],
      yInWorld = this.Y.Matrix[0][0];

    ctx.beginPath();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let [xInWindow, yInWindow] = this.GetWindowCoordinates(xInWorld, yInWorld);
    ctx.moveTo(xInWindow, yInWindow);
    for (let i = 1; i < this.X.Rows; i++) {
      xInWorld = this.X.Matrix[i][0];
      yInWorld = this.Y.Matrix[i][0];
      [xInWindow, yInWindow] = this.GetWindowCoordinates(xInWorld, yInWorld);
      ctx.lineTo(xInWindow, yInWindow);
    }

    ctx.lineWidth = "1";
    ctx.strokeStyle = "yellowgreen";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();
  }

  OnBezier(dt, pointsCount) {
    this.X.changeSize(pointsCount, this.X.Columns);
    this.Y.changeSize(pointsCount, this.Y.Columns);
    for (let i = 0; i < pointsCount; i++) {
      this.X.Matrix[i][0] = i * dt;
      this.Y.Matrix[i][0] = Math.sin(i * dt);
    }
    this.SetParams(this.X, this.Y, this.WinArea);
  }

  OnLagrange() {
    let dx = Math.PI / 4,
      xL = 0,
      xH = Math.PI,
      N = (xH - xL) / dx;
  
    this.X.changeSize(N + 1, 1);
    this.Y.changeSize(N + 1, 1);

    for (let i = 0; i <= N; i++) {
      this.X.Matrix[i][0] = xL + i * dx;
      this.Y.Matrix[i][0] = Math.pow(
        2 + Math.cos(this.X.Matrix[i][0]),
        Math.sin(2 * this.X.Matrix[i][0])
      );
    }
    this.SetParams(this.X, this.Y, this.WinArea);
  }

  DrawBezier(NT) {
    let xInWorld = this.X.Matrix[0][0],
      yInWorld = this.Y.Matrix[0][0],
      dt = 1.0 / NT,
      N = this.X.Rows;

    let RX = new CVector(N),
      RY = new CVector(N);

    ctx.beginPath();
    let [xInWindow, yInWindow] = this.GetWindowCoordinates(xInWorld, yInWorld);
    ctx.moveTo(xInWindow, yInWindow);
    for (let k = 1; k <= NT; k++)
    {
      let t = k * dt;
      for (let i = 0; i < N; i++)
      {
        RX.Matrix[i][0] = this.X.Matrix[i][0];
        RY.Matrix[i][0] = this.Y.Matrix[i][0];
      }
      
      for (let j = N - 1; j > 0; j--)
      {
        for (let i = 0; i < j; i++)
        {
          RX.Matrix[i][0] =
            RX.Matrix[i][0] + t * (RX.Matrix[i + 1][0] - RX.Matrix[i][0]);

          RY.Matrix[i][0] =
            RY.Matrix[i][0] + t * (RY.Matrix[i + 1][0] - RY.Matrix[i][0]);
        }
      }
      xInWorld = RX.Matrix[0][0],
      yInWorld = RY.Matrix[0][0],
      [xInWindow, yInWindow] = this.GetWindowCoordinates(xInWorld, yInWorld);
      ctx.lineTo(xInWindow, yInWindow);
    }
    
    ctx.lineWidth = "2";
    ctx.strokeStyle = "coral";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();
  }

  DrawLagrange() {
    let dx = 0.2,
      xL = 0,
      xH = Math.PI,
      N = (xH - xL) / (Math.PI / 4);

    let NL = Math.round((xH - xL) / dx),
      XL = new CVector(NL + 1),
      YL = new CVector(NL + 1);

    XL.Matrix[0][0] = 1
    for (let i = 0; i < NL + 1; i++) {
      XL.Matrix[i][0] = xL + i * dx;
      YL.Matrix[i][0] = Lagrange(this.X, this.Y, XL.Matrix[i][0], N + 1);
    }

    let xInWorld = XL.Matrix[0][0],
      yInWorld = YL.Matrix[0][0],
      xInWindow = 0,
      yInWindow = 0;

    ctx.beginPath();
    [xInWindow, yInWindow] = this.GetWindowCoordinates(xInWorld, yInWorld);
    ctx.moveTo(xInWindow, yInWindow);
    for (let i = 1; i < XL.Rows; i++) {
      xInWorld = XL.Matrix[i][0];
      yInWorld = YL.Matrix[i][0];
      [xInWindow, yInWindow] = this.GetWindowCoordinates(xInWorld, yInWorld);
      ctx.lineTo(xInWindow, yInWindow);
    }
    
    ctx.lineWidth = "2";
    ctx.strokeStyle = "coral";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.closePath();
  }
}

const plot = new CPlot2D();

/**
 * @param {Array<Array<number>>} areaInWorldCoordinates two dimentional array, contains coordinates of top left and bottom right corners
 * @param {Array<Array<number>>} areaInWindowCoordinates two dimentional array, contains coordinates of top left and bottom right corners
 */
function SpaceToWindow(areaInWorldCoordinates, areaInWindowCoordinates) {
  let [x_min, y_max] = areaInWorldCoordinates[0];
  let [x_max, y_min] = areaInWorldCoordinates[1];

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

let lagrange = document.getElementById("lagrange"),
  bezier1 = document.getElementById("bezier1"),
  bezier2 = document.getElementById("bezier2"),
  bezier3 = document.getElementById("bezier3"),
  bezier4 = document.getElementById("bezier4"),
  bezier5 = document.getElementById("bezier5");

let beziers = [bezier1, bezier2, bezier3, bezier4, bezier5],
  beziersData = [
    [Math.PI / 4, 9],
    [Math.PI / 3, 4],
    [Math.PI / 2, 3],
    [Math.PI / 2, 5],
    [Math.PI / 4, 4]
  ];

beziers.forEach((bezier, i) => {
  bezier.addEventListener("click", () => {
    plot.OnBezier(...beziersData[i]);
    plot.Draw();
    plot.DrawBezier(50);
  });
});

lagrange.addEventListener("click", () => {
  plot.OnLagrange();
  plot.Draw();
  plot.DrawLagrange();
});