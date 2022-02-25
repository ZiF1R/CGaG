import { CMatrix } from "./node_modules/cmatrix-cvector/CMatrix.js";
import { CVector } from "./node_modules/cmatrix-cvector/CVector.js";
import { ScalarMult, VectorMult } from "./node_modules/cmatrix-cvector/AdditionalOperations.js";

class CPyramid {
  constructor() {
    this.Vertexes = new CMatrix(3, 6);

    // Default coordinates for pyramid vertexes.
    // In first row contains x coordinates,
    // in second - y coordinates,
    // in third - z coordinates,
    // e.g. point A -> first column => (6, 0, 0)
    this.Vertexes.Matrix = [
      [6, 0, -6, 2, 0, -2],
      [0, -6, 0, 0, -2, 0],
      [0, 0, 0, 6, 6, 6]
    ];
  }

  GetRect(vertexes, viewRect) {

  }

  DrawWithoutInvisibleLines(pointOfView, viewArea) {

  }

  DrawWithInvisibleLines(pointOfView, viewArea) {

  }
}

/**
 * @param {Array<number>} areaInWorldCoordinates 
 * @param {Array<number>} areaInWindowCoordinates 
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