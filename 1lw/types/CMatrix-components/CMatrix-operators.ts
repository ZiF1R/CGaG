import { CMatrix } from "../CMatrix";

CMatrix.prototype.Add = function(parameter: CMatrix | number): CMatrix {
  return ApplyMatrixOperation(parameter)(this, "+");
}

CMatrix.prototype.Subtract = function(parameter: CMatrix | number): CMatrix {
  return ApplyMatrixOperation(parameter)(this, "-");
}

CMatrix.prototype.Multiply = function(parameter: CMatrix | number): CMatrix {
  return ApplyMatrixOperation(parameter)(this, "*");
}

type Operation = "+" | "-" | "*" | "/";

function ApplyMatrixOperation(arg: CMatrix | number): (matrix: CMatrix, operation: Operation) => CMatrix {
  if (typeof arg === 'number') {
    return (matrix: CMatrix, operation: Operation) => {
      return operationsForNumber(matrix, arg, operation);
    }
  }
  else {
    return (matrix: CMatrix, operation: Operation) => {
      return operationsForMatrix(matrix, arg, operation);
    }
  }
}

function operationsForMatrix(matrix: CMatrix, otherMatrix: CMatrix, operation: Operation): CMatrix {
  let result = new CMatrix(matrix.Rows, otherMatrix.Columns);
  if (matrix.Columns !== otherMatrix.Rows)
    throw TypeError("Columns count of CMatrix parameter must be equal to rows count of matrix!");

  for (let row = 0; row < matrix.Rows; row++)
    for (let column = 0; column < otherMatrix.Columns; column++) {
      switch(operation) {
        case "+":
          result.Matrix[row][column] = matrix.Matrix[row][column] + otherMatrix.Matrix[row][column]; break;
        case "-":
          result.Matrix[row][column] = matrix.Matrix[row][column] - otherMatrix.Matrix[row][column]; break;
        case "*": {
          result.Matrix[row][column] = 0;
          for (let columnB = 0; columnB < matrix.Columns; columnB++)
            result.Matrix[row][column] += matrix.Matrix[row][columnB] * otherMatrix.Matrix[columnB][column];
          break;
        }
      }
    }

  return result;
}

function operationsForNumber(matrix: CMatrix, number: number, operation: Operation): CMatrix {
  let result = new CMatrix(matrix.Rows, matrix.Columns);

  result.Matrix.map((arr: number[]) =>
    arr.map((num: number) => {
      switch(operation) {
        case "+": num += number; break;
        case "-": num -= number; break;
        case "*": num *= number; break;
        default: break;
      }
      return num;
    }
  ));

  return result;
}
