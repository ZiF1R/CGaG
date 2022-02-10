import { CMatrix } from "./types/CMatrix";
import { CVector } from "./types/CVector";
import { VectorMult } from "./AdditionalOperations";

export let A = new CMatrix(3, 3);
export let B = new CMatrix(A);
export let V1 = new CVector(3);
export let V2 = new CVector(3);

A.Matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

B.Matrix = [
  [4, 5, 6],
  [1, 2, 3],
  [7, 8, 9],
];

V1.Matrix = [
  [1],
  [3],
  [6],
];

V2.Matrix = [
  [3],
  [1],
  [6],
];
console.log(VectorMult(V1, V2));
