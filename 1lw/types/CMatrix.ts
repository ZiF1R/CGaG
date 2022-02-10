export class CMatrix {
  private rows: number;
  private columns: number;
  private matrix: number[][];

  public constructor(rows: number, columns: number); // Default constructor, fill matrix with zeros
  public constructor(otherMatrix: CMatrix); // Constructor for copying other matrix

  public constructor(...args: any[]) {
    if (args.length === 2) {
      let [ rows, columns ] = args;
      if (rows < 0 || columns < 0)
        throw new RangeError("Size of matrix must be not negative number!");

      this.rows = rows;
      this.columns = columns;
      this.matrix = Array(this.rows).fill(0).map(
          () => Array(this.columns).fill(0)
      );
    }
    else {
      let [ otherMatrix ] = args;
      this.rows = otherMatrix.Rows;
      this.columns = otherMatrix.Columns;
      this.matrix = otherMatrix.matrix;
    }
  }

  get Matrix(): number[][] {
    return this.matrix;
  }

  set Matrix(matrix: number[][]) {
    // check if the columns of assigned matrix have one size
    let isEqualColumnsSize =
      matrix.filter(arr => arr.length !== this.columns).length === 0;

    // if size of columns or rows doesn't match, throw error
    if (matrix.length !== this.rows || !isEqualColumnsSize) {
      throw new TypeError("Assigned matrix size doesn't match to aggregated matrix!");
    }
    else this.matrix = matrix;
  }

  get Rows(): number {
    return this.rows;
  }

  get Columns(): number {
    return this.columns;
  }

  getRow(index: number): number[] | null {
    if (index > this.rows || index < 0)
      return null;
    return this.matrix[index];
  }

  getColumn(index: number): number[] | null {
    if (index > this.columns || index < 0)
      return null;
    let resultColumn: Array<number> = [];

    for (let row = 0; row < this.rows; row++)
      for (let column = 0; column < this.columns; column++)
        if (column === index)
          resultColumn.push(this.matrix[row][column]);

    return resultColumn;
  }

  /**
   * @returns matrix with new sizes
   */
  changeSize(newRows: number, newColumns: number): number[][] {
    if (newRows < 0 || newColumns < 0)
      throw new RangeError("Size of matrix must be not negative number!");

    let newMatrix = Array(newRows).fill(0).map(
        () => Array(newColumns).fill(0)
    );

    for (let row = 0; row < newRows; row++)
      for (let column = 0; column < newColumns; column++)
        if (row < this.rows && column < this.columns)
          newMatrix[row][column] = this.matrix[row][column];

    this.rows = newRows;
    this.columns = newColumns;

    return this.matrix = newMatrix
  }

  /**
   * @returns transposed matrix
   */
  declare transpose: () => number[][];

  /**
   * @returns minimal element of matrix
   */
  declare Min: () => number;

  /**
   * @returns maximal element of matrix
   */
  declare Max: () => number;

  declare Add: (parameter: CMatrix | number) => number[][];
  declare Subtract: (parameter: CMatrix | number) => number[][];
  declare Multiply: (parameter: CMatrix | number) => number[][];
}

import "./CMatrix-components/CMatrix-methods";
import "./CMatrix-components/CMatrix-operators";
