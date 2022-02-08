export class CMatrix {
  public rows: number;
  public columns: number;
  public matrix: number[][];

  constructor(rows: number = 1, columns: number = 1) {
    if (rows < 0 || columns < 0)
      throw new RangeError("Size of matrix must be not negative number!");

    this.rows = rows;
    this.columns = columns;
    this.matrix = Array(this.rows).fill(0).map(
        () => Array(this.columns).fill(0)
    );
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