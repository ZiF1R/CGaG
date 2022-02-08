export class CMatrix {
  public rows: number;
  public columns: number;
  public matrix: number[][];

  // Default constructor,
  // fill matrix with zeros
  public constructor(rows: number, columns: number);

  // Constructor for copying other matrix
  public constructor(otherMatrix: CMatrix);

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
      this.rows = otherMatrix.getRowsCount();
      this.columns = otherMatrix.getColumnsCount();
      this.matrix = Array(this.rows).fill(0).map(
          () => Array(this.columns).fill(0)
      );
    }
  }

  getRowsCount(): number {
    return this.rows;
  }

  getColumnsCount(): number {
    return this.columns;
  }

  getRow(rowNumber: number): number[] | null {
    if (rowNumber > this.rows || rowNumber < 0)
      return null;
    return this.matrix[rowNumber];
  }

  getColumn(columnNumber: number): number[] | null {
    if (columnNumber > this.columns || columnNumber < 0)
      return null;
    let resultColumn: Array<number> = [];

    for (let row = 0; row < this.matrix.length; row++)
      for (let column = 0; column < this.matrix[row].length; column++)
        if (column === columnNumber)
          resultColumn.push(this.matrix[row][column]);

    return resultColumn;
  }
}