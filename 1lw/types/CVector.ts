import { CMatrix } from "./CMatrix";

export class CVector extends CMatrix {
  constructor(rows: number) {
    super(rows, 1);
  }

  declare Add: (parameter: number | CVector) => CMatrix;
  declare Subtract: (parameter: number | CMatrix) => CMatrix;
}

//module contains realization of methods with operations for vectors
import "./CVector-components/CVector-operators";
