class CMatrix {
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
}