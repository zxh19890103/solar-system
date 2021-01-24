import { Matrix } from "./canvas-uni-matrix";

const mat0 = new Matrix(
  `
  1 2 4
  0 1 2
  0 1 7
  `
)

const mat1 = new Matrix(
  `
  0 9 1
  9 2 3
  7 4 1
  `
)
const mat2 = new Matrix(`
1 0 9
2 4 6
9 8 1
`)
mat0.print("mat0")
mat1.print("mat1")
mat2.print("mat2")

const v = [9, 2, 1]

const mat3 = mat0.multipWith(mat1).multipWith(mat2)
console.log(mat3.multipWithVector(...v))
console.log(mat0.multipWithVector(...mat1.multipWithVector(...mat2.multipWithVector(...v))))
// mat0.manipulatesWith(mat1).print("mat0xmat1")
// mat1.manipulatesWith(mat0).print("mat1xmat0")