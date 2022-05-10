import { CMatrix } from "./types/CMatrix";
import { CVector } from "./types/CVector";

// оппеделяем функцию которая будет выводить матрицу в консоль
// (просто чтобы было, в js можно и без этого выводить многомерные массивы в консоль)
export const PrintMatrix = (matrix: CMatrix): void => {
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

// вычисляет векторное произведение векторов
export const VectorMult = (v1: CVector, v2: CVector): CVector => {
  // проверяем на равенство размерностей
  if (v1.Rows !== v2.Rows)
    throw new Error("The sizes of vectors must be equal!");

  let result: CVector = new CVector(v1.Rows);
  result.Matrix = [
    [v1.Matrix[1][0]*v2.Matrix[2][0] - v2.Matrix[1][0]*v1.Matrix[2][0]],
    [-(v1.Matrix[0][0]*v2.Matrix[2][0] - v2.Matrix[0][0]*v1.Matrix[2][0])],
    [v1.Matrix[0][0]*v2.Matrix[1][0] - v2.Matrix[0][0]*v1.Matrix[1][0]],
  ];

  return result;
};

// вычисляет скалярное произведение векторов
export const ScalarMult = (v1: CVector, v2: CVector): number => {
  // проверяем на равенство размерностей
  if (v1.Rows !== v2.Rows)
    throw new Error("The sizes of vectors must be equal!");

  let result: number = 0;
  for (let row = 0; row < v1.Rows; row++)
    for (let column = 0; column < v1.Columns; column++)
    result += v1.Matrix[row][column] * v2.Matrix[row][column];

  return result;
};


// вычисляет модуль вектора
export const ModOfVector = (v: CVector): number => {
  let result: number = 0;

  for (let row = 0; row < v.Rows; row++)
    for (let column = 0; column < v.Columns; column++)
      result += v.Matrix[row][column]**2;

  return Math.sqrt(result);
};

// вычисляет косинус между векторами
export const CosBetweenVectors = (v1: CVector, v2: CVector): number => {
  return ScalarMult(v1, v2) / (ModOfVector(v1) * ModOfVector(v2));
};

// преобразует сферические координаты в декартовы
export const SphereToDecart = (point: CVector): CVector => {
  let result: CVector = new CVector(3);
  result.Matrix = [
    [point.Matrix[0][0] * Math.cos(point.Matrix[1][0]) * Math.sin(point.Matrix[2][0])],
    [point.Matrix[0][0] * Math.sin(point.Matrix[1][0]) * Math.sin(point.Matrix[2][0])],
    [point.Matrix[0][0] * Math.cos(point.Matrix[2][0])],
  ];

  return result;
}
