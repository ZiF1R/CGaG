import { CMatrix } from "../CMatrix";
import { CVector } from "../CVector";

CVector.prototype.Add = function(parameter: number | CVector): CMatrix {
  if (typeof parameter === 'object' && this.Rows !== parameter.Rows)
    throw new Error("The size of two vectors must be equal!");

  let result = new CMatrix(this.Rows, this.Columns);
  for (let row = 0; row < this.Rows; row++)
    for (let column = 0; column < this.Columns; column++) {
      if (typeof parameter === 'object')
        result.Matrix[row][column] = this.Matrix[row][column] + parameter.Matrix[row][column];
      else
        result.Matrix[row][column] += parameter;
    }

  return result;
}

CVector.prototype.Subtract = function(parameter: number | CVector): CMatrix {
  if (typeof parameter === 'object' && this.Rows !== parameter.Rows)
    throw new Error("The size of two vectors must be equal!");

  let result = new CMatrix(this.Rows, this.Columns);
  for (let row = 0; row < this.Rows; row++)
    for (let column = 0; column < this.Columns; column++) {
      if (typeof parameter === 'object')
        result.Matrix[row][column] = this.Matrix[row][column] - parameter.Matrix[row][column];
      else
        result.Matrix[row][column] -= parameter;
    }

  return result;
}
