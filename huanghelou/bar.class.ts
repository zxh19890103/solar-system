import { Thing } from "../common/thing.class"
import { parseColor, randColor } from "../common/utils"

const { cos, sin, PI } = Math

export class BarThing extends Thing {

  readonly size: number = 0
  readonly length: number = 0

  constructor(size: number, length: number) {
    super()
    this.size = size
    this.length = length
  }

  make(): void {
    const color = parseColor("#795548")
    for (let a = 0; a < PI * 2; a += .17) {
      this.vertices.push(
        this.size * cos(a),
        this.size * sin(a),
        this.length
      )
      this.vertices.push(
        this.size * cos(a),
        this.size * sin(a),
        0
      )
      this.colors.push(...color, ...color)
    }

    const down = .1
    this.vertices.push(
      0, 0, this.length * .67 - down,
      0, 0, this.length - down,
      0, this.length * .2, this.length - down
    )

    const color2 = parseColor("#ff5548")

    this.colors.push(...color2, ...color2, ...color2)
  }

  render(gl: WebGLRenderingContext): () => void {
    const { offset, VertexCount } = this
    return () => {
      gl.drawArrays(
        gl.LINES,
        offset,
        VertexCount - 3
      )
      gl.drawArrays(
        gl.LINE_LOOP,
        offset + VertexCount - 3,
        3
      )
    }
  }

}