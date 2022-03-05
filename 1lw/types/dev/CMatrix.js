export class CMatrix {
    constructor(...args) {
        if (args.length === 2) {
            let [rows, columns] = args;
            if (rows < 0 || columns < 0)
                throw new RangeError("Size of matrix must be not negative number!");
            this.rows = rows;
            this.columns = columns;
            this.matrix = Array(this.rows).fill(0).map(() => Array(this.columns).fill(0));
        }
        else {
            let [otherMatrix] = args;
            this.rows = otherMatrix.Rows;
            this.columns = otherMatrix.Columns;
            this.matrix = otherMatrix.matrix;
        }
    }
    get Matrix() {
        return this.matrix;
    }
    set Matrix(matrix) {
        // check if the columns of assigned matrix have one size
        let isEqualColumnsSize = matrix.filter(arr => arr.length !== this.columns).length === 0;
        // if size of columns or rows doesn't match, throw error
        if (matrix.length !== this.rows || !isEqualColumnsSize) {
            throw new Error("Assigned matrix size doesn't match to aggregated matrix!");
        }
        else
            this.matrix = matrix;
    }
    get Rows() {
        return this.rows;
    }
    get Columns() {
        return this.columns;
    }
    getRow(index) {
        if (index > this.rows || index < 0)
            return null;
        return this.matrix[index];
    }
    getColumn(index) {
        if (index > this.columns || index < 0)
            return null;
        let resultColumn = [];
        for (let row = 0; row < this.rows; row++)
            for (let column = 0; column < this.columns; column++)
                if (column === index)
                    resultColumn.push(this.matrix[row][column]);
        return resultColumn;
    }
    /**
     * @returns matrix with new sizes
     */
    changeSize(newRows, newColumns) {
        if (newRows < 0 || newColumns < 0)
            throw new RangeError("Size of matrix must be not negative number!");
        let newMatrix = Array(newRows).fill(0).map(() => Array(newColumns).fill(0));
        for (let row = 0; row < newRows; row++)
            for (let column = 0; column < newColumns; column++)
                if (row < this.rows && column < this.columns)
                    newMatrix[row][column] = this.matrix[row][column];
        this.rows = newRows;
        this.columns = newColumns;
        return this.matrix = newMatrix;
    }
    Min() {
      let minOfRows = [];
      this.Matrix.forEach((arr) => minOfRows.push(Math.min(...arr)));
      return Math.min(...minOfRows);
    }
    Max() {
      let maxOfRows = [];
      this.Matrix.forEach((arr) => maxOfRows.push(Math.max(...arr)));
      return Math.max(...maxOfRows);
    }
    transpose() {
      let transparentMatrix = new CMatrix(this.Columns, this.Rows);
      for (let i = 0; i < this.Rows; i++)
          for (let j = 0; j < this.Columns; j++)
              transparentMatrix.Matrix[j][i] = this.Matrix[i][j];
      return transparentMatrix;
    }
    Add(parameter) {
      return ApplyMatrixOperation(parameter)(this, "+");
    }
    Subtract(parameter) {
      return ApplyMatrixOperation(parameter)(this, "-");
    }
    Multiply(parameter) {
      return ApplyMatrixOperation(parameter)(this, "*");
    }
}
function ApplyMatrixOperation(arg) {
  if (typeof arg === 'number') {
      return (matrix, operation) => {
          return operationsForNumber(matrix, arg, operation);
      };
  }
  else {
      return (matrix, operation) => {
          return operationsForMatrix(matrix, arg, operation);
      };
  }
}
function operationsForMatrix(matrix, otherMatrix, operation) {
  let result = new CMatrix(matrix.Rows, otherMatrix.Columns);
  if (matrix.Columns !== otherMatrix.Rows)
      throw TypeError("Columns count of CMatrix parameter must be equal to rows count of matrix!");
  for (let row = 0; row < matrix.Rows; row++)
      for (let column = 0; column < otherMatrix.Columns; column++) {
          switch (operation) {
              case "+":
                  result.Matrix[row][column] = matrix.Matrix[row][column] + otherMatrix.Matrix[row][column];
                  break;
              case "-":
                  result.Matrix[row][column] = matrix.Matrix[row][column] - otherMatrix.Matrix[row][column];
                  break;
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
function operationsForNumber(matrix, number, operation) {
  let result = new CMatrix(matrix.Rows, matrix.Columns);
  result.Matrix = matrix.Matrix;
  result.Matrix.map((arr) => arr.map((num) => {
      switch (operation) {
          case "+":
              num += number;
              break;
          case "-":
              num -= number;
              break;
          case "*":
              num *= number;
              break;
          default: break;
      }
      return num;
  }));
  return result;
}
