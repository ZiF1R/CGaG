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

CMatrix.prototype.transpose = function(): CMatrix {
  let transparentMatrix = new CMatrix(this.Columns, this.Rows);
  for (let i = 0; i < this.Rows; i++)
    for (let j = 0; j < this.Columns; j++)
      transparentMatrix.Matrix[j][i] = this.Matrix[i][j];

  return transparentMatrix;
}
