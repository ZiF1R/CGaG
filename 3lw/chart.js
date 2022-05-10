import { CMatrix } from "./types/CMatrix.js";

const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

// задаем область в оконных координатах
const areaInWindowCoordinates = [
  [50, 50],
  [500, 500]
];

ctx.font = '16px Raleway';
ctx.textAlign = 'right';
ctx.textBaseline = 'middle';

// определяем обработчики для кнопок с графиками
document.querySelector(".f1").addEventListener("click", () => {
  // задаем кисть для рисования и вызываем функцию для отображения графика
  let pen = new CMyPen(2, "yellowgreen");
  drawGraph(
    (x) => Math.sin(x) / x,
    [Math.PI * -3, Math.PI * 3],
    Math.PI / 36,
    pen
  );
});
document.querySelector(".f2").addEventListener("click", () => {
  // задаем кисть для рисования и вызываем функцию для отображения графика
  let pen = new CMyPen(5, "tomato");
  drawGraph(
    (x) => Math.pow(x, 3),
    [-5, 5],
    0.25,
    pen
  );
});
document.querySelector(".f3").addEventListener("click", () => {
  // задаем кисть для рисования и вызываем функцию для отображения графика
  let pen = new CMyPen(7, "coral");
  drawGraph(
    (x) => Math.sqrt(x) * Math.sin(x),
    [0, 6 * Math.PI],
    Math.PI / 36,
    pen
  );
});
document.querySelector(".f4").addEventListener("click", () => {
  // задаем кисть для рисования и вызываем функцию для отображения графика
  let pen = new CMyPen(4, "pink");
  drawGraph(
    (x) => Math.pow(x, 2),
    [-10, 10],
    0.25,
    pen
  );
});

/**
 *
 * @param {Array<Array<Number>>} areaInWorldCoordinates - область в мировых координатах
 * @param {Array<Array<Number>>} areaInWindowCoordinates - область в оконных координатах
 * @returns матрицу пересчета из мировых координат в оконные
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

class CMyPen {
  constructor(penWidth, penColor) {
    this.PenWidth = penWidth;
    this.PenColor = penColor;
  }
}

/**
 * @param {Function} func - функция которой описывается график
 * @param {Array<Number>} range - промежуток по оси Х, на котором будет строится график
 * @param {Number} dx - расстояние между соседними точками по оси Х
 * @param {CMyPen} pen - кисть для рисования графика
 */
function drawGraph(func, range, dx, pen) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let Y = [],
    X = [];

  for (let i = range[0]; i < Math.abs(range[1]); i += dx) {
    Y.push(+func(i).toPrecision(3));
    X.push(i);
  }

  let Y_min = Math.min(...Y),
    Y_max = Math.max(...Y);

  let Tsw = SpaceToWindow(
    [[range[0], Y_min], [range[1], Y_max]],
    areaInWindowCoordinates
  );

  let M = new CMatrix(3, X.length);
  M.Matrix = [
    X,
    Y,
    Array(X.length).fill(1)
  ];

  let points = Tsw.Multiply(M).Matrix;

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[1][0]);
  for (let i = 0; i < points[0].length - 1; i++) {
    ctx.lineTo(points[0][i + 1], points[1][i + 1]);
  }

  ctx.lineWidth = pen.PenWidth;
  ctx.strokeStyle = pen.PenColor;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.closePath();
}
