import { ObjectProgram } from "../common/program.class"
import { Thing } from "../common/thing.class"
import { parseColor, randColor } from "../common/utils"

const { PI, sin, cos } = Math

export class HornThing extends Thing {

  readonly width: number
  readonly length: number
  readonly height: number

  constructor(length: number, width: number, height: number) {
    super()
    this.width = width
    this.length = length
    this.height = height
  }

  static LEFT_VERTEX_INDEX = 1
  static RIGHT_VERTEX_INDEX = 0
  static HEAD_VERTEX_INDEX = 2

  static KEY_VERTEX_COUNT = 4

  make() {
    const color = parseColor("#795548")
    this.vertices.push(
      this.width / 2, 0, 0, // 0
      - this.width / 2, 0, 0, // 1
      0, -.3, this.height, // 2
      0, 0, 0, //3
    )
    this.colors.push(...color, ...color, ...color, ...color)
    // curve from tail to head
    const k = .1
    const a = this.height
    // k2 * y^2 === k * y ^2 + a
    const k2 = k + a / (this.length * this.length)
    // k3 * this.length === this.width / 2
    const k3 = this.width / (2 * this.length)
    let index = 0

    this.indices.push(
      index + 2, index,
      index + 2, index + 1
    )

    index += this.VertexCount

    for (let y = 0; y < this.length; y += .08) {
      this.vertices.push(
        0, y, k * y * y + a // head
      )
      this.vertices.push(
        this.width / 2 - k3 * y, y, k2 * y * y // right 4
      )
      this.vertices.push(
        - (this.width / 2 - k3 * y), y, k2 * y * y // left 5
      )
      this.vertices.push(
        0, y * 1.4, k * (y * y) + a + .5 * y // head's head
      )

      this.indices.push(
        index, index + 1,
        index, index + 2,
        index, index + 3
      )
      this.indices.push(
        index - 2, index + 3
      )
      index += 4
      this.colors.push(...color, ...color, ...color, ...color)
    }
  }

  render(gl: WebGLRenderingContext) {
    const { indexOffset, offset, VertexCount, IndexCount } = this
    return () => {
      gl.drawElements(
        gl.LINES, IndexCount, gl.UNSIGNED_SHORT, indexOffset * 2
      )
    }
  }
}