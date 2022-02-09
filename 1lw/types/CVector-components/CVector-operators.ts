import { CVector } from "../CVector";

CVector.prototype.Add = function(parameter: number | CVector): number[][] {
  if (typeof parameter === 'object' && this.Rows !== parameter.Rows)
    throw new Error("The size of two vectors must be equal!");

  let result = JSON.parse(JSON.stringify(this.Matrix));
  for (let row = 0; row < this.Rows; row++)
    for (let column = 0; column < this.Columns; column++) {
      if (typeof parameter === 'object')
        result[row][column] = this.Matrix[row][column] + parameter.Matrix[row][column];
      else
        result[row][column] += parameter;
    }

  return result;
}

CVector.prototype.Subtract = function(parameter: number | CVector): number[][] {
  if (typeof parameter === 'object' && this.Rows !== parameter.Rows)
    throw new Error("The size of two vectors must be equal!");

  let result = JSON.parse(JSON.stringify(this.Matrix));
  for (let row = 0; row < this.Rows; row++)
    for (let column = 0; column < this.Columns; column++) {
      if (typeof parameter === 'object')
        result[row][column] = this.Matrix[row][column] - parameter.Matrix[row][column];
      else
        result[row][column] -= parameter;
    }

  return result;
}
