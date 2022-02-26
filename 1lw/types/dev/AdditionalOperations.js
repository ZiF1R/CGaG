import { CVector } from "./CVector.js";
import { CMatrix } from "./CMatrix.js";
export const PrintMatrix = (matrix) => {
    let result = "[\n  ";
    for (let i = 0; i < matrix.Rows; i++) {
        result += "[";
        for (let j = 0; j < matrix.Columns; j++) {
            if (j + 1 === matrix.Columns)
                result += matrix.Matrix[i][j];
            else
                result += matrix.Matrix[i][j] + ', ';
        }
        if (i + 1 === matrix.Rows)
            result += "]\n";
        else
            result += "],\n  ";
    }
    result += "]";
    console.log(result);
};
export const VectorMult = (v1, v2) => {
    if (v1.Rows !== v2.Rows)
        throw new Error("The sizes of vectors must be equal!");
    let result = new CVector(v1.Rows);
    result.Matrix = [
        [v1.Matrix[1][0] * v2.Matrix[2][0] - v2.Matrix[1][0] * v1.Matrix[2][0]],
        [-(v1.Matrix[0][0] * v2.Matrix[2][0] - v2.Matrix[0][0] * v1.Matrix[2][0])],
        [v1.Matrix[0][0] * v2.Matrix[1][0] - v2.Matrix[0][0] * v1.Matrix[1][0]],
    ];
    return result;
};
export const ScalarMult = (v1, v2) => {
    if (v1.Rows !== v2.Rows)
        throw new Error("The sizes of vectors must be equal!");
    let result = 0;
    for (let row = 0; row < v1.Rows; row++)
        for (let column = 0; column < v1.Columns; column++)
            result += v1.Matrix[row][column] * v2.Matrix[row][column];
    return result;
};
export const ModOfVector = (v) => {
    let result = 0;
    for (let row = 0; row < v.Rows; row++)
        for (let column = 0; column < v.Columns; column++)
            result += Math.pow(v.Matrix[row][column], 2);
    return Math.sqrt(result);
};
export const CosBetweenVectors = (v1, v2) => {
    return ScalarMult(v1, v2) / (ModOfVector(v1) * ModOfVector(v2));
};
/**
 * @param {CMatrix} viewPoint
 * @returns {CMatrix} (r, azimuth, angle) coordinates in decart coordinate system
 */
export function SphereToDecart(viewPoint) {
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
/**
 * @param {Array<Array<number>>} areaInWorldCoordinates two dimentional array, contains coordinates of top left and bottom right corners
 * @param {Array<Array<number>>} areaInWindowCoordinates two dimentional array, contains coordinates of top left and bottom right corners
 */
export function SpaceToWindow(areaInWorldCoordinates, areaInWindowCoordinates) {
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
/**
 * @param {number} r
 * @param {number} azimuth - from X axis
 * @param {number} angle - from Z axis
 */
export function CreateViewCoord(r, azimuth, angle) {
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
export function CreateTranslate2D(dx, dy) {
  let TM = new CMatrix(3, 3);
  TM.Matrix = [
    [1, 0, dx],
    [0, 1, dy],
    [0, 0, 1]
  ];

  return TM;
}
export function CreateRotate2D(angle) {
  let fg = angle % 360.0;
  let angleInRadians = (fg / 180.0) * Math.PI;

  let RM = new CMatrix(3, 3);
  RM.Matrix = [
    [Math.cos(angleInRadians), -Math.sin(angleInRadians), 0],
    [Math.sin(angleInRadians), Math.cos(angleInRadians), 0],
    [0, 0, 1]
  ];

  return RM;
}
