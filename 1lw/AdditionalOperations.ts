import { CVector } from "./types/CVector";

export const VectorMult = (v1: CVector, v2: CVector): CVector => {
  if (v1.Rows !== v2.Rows)
    throw new Error("The sizes of vectors must be equal!");

  let result: CVector = new CVector(v1.Rows);
  result.Matrix = [
    [v1.Matrix[1][0]*v2.Matrix[2][0] - v2.Matrix[1][0]*v1.Matrix[2][0]],
    [v1.Matrix[0][0]*v2.Matrix[2][0] - v2.Matrix[0][0]*v1.Matrix[2][0]],
    [v1.Matrix[0][0]*v2.Matrix[1][0] - v2.Matrix[1][0]*v1.Matrix[0][0]],
  ];

  return result;
};

export const ScalarMult = (v1: CVector, v2: CVector): number => {
  if (v1.Rows !== v2.Rows)
    throw new Error("The sizes of vectors must be equal!");

  let result: number = 0;
  for (let row = 0; row < v1.Rows; row++)
    for (let column = 0; column < v1.Columns; column++)
    result += v1.Matrix[row][column] * v2.Matrix[row][column];

  return result;
};

export const ModOfVector = (v: CVector): number => {
  let result: number = 0;

  for (let row = 0; row < v.Rows; row++)
    for (let column = 0; column < v.Columns; column++)
      result += v.Matrix[row][column]**2;

  return Math.sqrt(result);
};

export const CosBetweenVectors = (v1: CVector, v2: CVector): number => {
  return ScalarMult(v1, v2) / (ModOfVector(v1) * ModOfVector(v2));
};

export const SphereToDecart = (point: CVector): CVector => {
  let result: CVector = new CVector(3);
  result.Matrix = [
    [point.Matrix[0][0] * Math.cos(point.Matrix[1][0]) * Math.sin(point.Matrix[2][0])],
    [point.Matrix[0][0] * Math.sin(point.Matrix[1][0]) * Math.sin(point.Matrix[2][0])],
    [point.Matrix[0][0] * Math.cos(point.Matrix[2][0])],
  ];

  return result;
}
