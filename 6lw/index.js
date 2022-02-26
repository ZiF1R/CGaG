import { CMatrix } from './node_modules/computer-graphics-utils/CMatrix.js';
import { CVector } from './node_modules/computer-graphics-utils/CVector.js';
import {
  CreateViewCoord
} from "./node_modules/computer-graphics-utils/AdditionalOperations.js";

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
  // console.log(Q)

  return [
    [x_min, y_max],
    [x_max, y_min]
  ];
}
GetProjection([[1, 2], [3, 4]], new CMatrix(3, 3), new CVector(3));
