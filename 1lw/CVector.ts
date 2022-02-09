import { CMatrix } from "./CMatrix";

export class CVector extends CMatrix {
  constructor(rows: number) {
    super(rows, 1);
  }

  declare Add: (parameter: number | CVector) => number[][];
}

import "./CVector-components/CVector-operators";
