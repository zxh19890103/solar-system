import { Matrix } from "./canvas-uni-matrix"

const mat0 = new Matrix(
  `
  0 1 0
  -1 0 0
  0 0 1
  `
)

console.log(mat0.multipleWithXyz(1, 2, 3))

