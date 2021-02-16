import { Vector } from "./canvas-uni-vector"

export class Matrix {
  /**
   * count as rows
   */
  private m: number = 0
  /**
   * count as columns
   */
  private n: number = 0

  private data: Array<Array<number>> = null

  constructor(str?: string) {
    if (str === undefined) return
    this.fromString(str)
  }

  static create(m: number, n: number) {
    const mat = new Matrix()
    mat.m = m
    mat.n = n
    mat.data = Array(m).fill(0).map(() => {
      return Array(n).fill(0)
    })
    return mat
  }

  fromString(str: string) {
    this.data = str
      .trim()
      .split(/[\n]+/)
      .map(row => {
        return row
          .trim()
          .split(/[\s]+/)
          .map(element => {
            return parseFloat(element)
          })
      })
    this.m = this.data.length
    this.n = this.data[0].length
    return this
  }

  toString() {
    return `
    Matrix: ${this.m} x ${this.n}
    ${this.data.map(row => {
      return row.join(" ")
    }).join('\n    ')}
    `
  }

  print(tag?: string) {
    if (tag) console.log(tag)
    console.log(this.toString())
  }

  row(m: number) {
    return this.data[m].map(x => x)
  }

  column(n: number) {
    return this.data.map(row => {
      return row[n]
    })
  }

  multipleWith(matrix: Matrix | string) {
    const realmatrix = typeof matrix === "string" ? new Matrix(matrix) : matrix
    const mat = Matrix.create(realmatrix.m, this.n)
    const data = mat.data
    const { m, n } = mat
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        data[r][c] = this.dot(realmatrix.column(r), this.row(c))
      }
    }
    return mat
  }

  multipleBy(matrix: Matrix | string) {
    const mat = typeof matrix === "string" ? new Matrix(matrix) : matrix
    return mat.multipleWith(this)
  }

  private dot(v1: number[], v2: number[]) {
    return v1.reduce((s, value, i) => {
      return s + value * (v2[i])
    }, 0)
  }

  multipleWithXyz(...nums: number[]) {
    return this.data.map(x => {
      return this.dot(x, nums)
    })
  }

  multipleWithVector(v: Vector) {
    return this.multipleWithXyz(...v.toPoint())
  }
}
