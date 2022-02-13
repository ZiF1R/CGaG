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
  result.Matrix = [[point[0]], [point[1]], [1]];
  result = Tsw.Multiply(result);

  return result.Matrix;
}
