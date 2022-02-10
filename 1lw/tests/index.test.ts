import { A, B, V1, V2 } from "../index";

describe("Operations with CMatrix", (): void => {
  test("Addition of CMatrix", (): void => {
    expect(A.Add(B).Matrix).toStrictEqual([
      [ 5, 7, 9 ],
      [ 5, 7, 9 ],
      [ 14, 16, 18 ]
    ]);
  });
  test("Multiplication of CMatrix", (): void => {
    expect(A.Multiply(B).Matrix).toStrictEqual([
      [ 27, 33, 39 ],
      [ 63, 78, 93 ],
      [ 99, 123, 147 ]
    ]);
  });
  test("Addition of CMatrix and CVector", (): void => {
    expect(A.Multiply(V1).Matrix).toStrictEqual([
      [ 25 ],
      [ 55 ],
      [ 85 ]
    ]);
  });
});

describe("Operations with CVector", (): void => {
  test("Multiplication of CVector", (): void => {
    expect(V1.transpose().Multiply(V2).Matrix).toStrictEqual([[42]]);
  });
  test("Multiplication of CVector and CMatrix", (): void => {
    expect(V1.transpose().Multiply(A).Multiply(V2).Matrix).toStrictEqual([[680]]);
  });
});


// describe("Test additional operations", (): void => {

// });
