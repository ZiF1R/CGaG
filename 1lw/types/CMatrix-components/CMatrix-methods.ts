import { CMatrix } from "../CMatrix";

CMatrix.prototype.Min = function(): number {
  let minOfRows: Array<number> = [];
  this.Matrix.forEach((arr: number[]) => minOfRows.push(Math.min(...arr)));
  return Math.min(...minOfRows);
}

CMatrix.prototype.Max = function(): number {
  let maxOfRows: Array<number> = [];
  this.Matrix.forEach((arr: number[]) => maxOfRows.push(Math.max(...arr)));
  return Math.max(...maxOfRows);
}

CMatrix.prototype.transpose = function(): number[][] {
  let transparentMatrix = Array(this.Columns).fill(0).map(arr => Array(this.Rows).fill(0));
  for (let i = 0; i < this.Rows; i++)
    for (let j = 0; j < this.Columns; j++)
      transparentMatrix[j][i] = this.Matrix[i][j];

  return transparentMatrix;
}
