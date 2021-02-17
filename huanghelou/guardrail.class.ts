import { Thing } from "../common/thing.class"
import { parseColor, randColor } from "../common/utils"
import { HornThing } from "./horn.class"

export class GuardtailThing extends Thing {

  readonly lt: vec3 // left top
  readonly rt: vec3 // right top
  readonly rb: vec3 // right bottom
  readonly lb: vec3 // left bottom

  constructor(...four: vec3[]) {
    super()
    console.assert(four.length === 4, "must be 4")
    this.lt = four[0]
    this.rt = four[1]
    this.rb = four[2]
    this.lb = four[3]
  }

  make(): void {
    this.pushVertex(
      ...this.lt,
      ...this.rt,
      ...this.rb,
      ...this.lb
    )

    this.indices.push(
      0, 1,
      1, 2,
      2, 3,
      3, 0
    )

    let offset = this.VertexCount

    const grid = this.mesh(this.lt, this.lb, this.rt, 6, 10)
    const nums = grid.flat() as number[]
    this.pushVertex(...nums)
    for (let i = 0; i < 6; i++) {
      this.indices.push(
        offset + i * 10 + 9,
        offset + i * 10
      )
    }
  }

  render(gl: WebGLRenderingContext): () => void {
    const { IndexCount, indexOffset } = this
    return () => {
      gl.drawElements(
        gl.LINES,
        IndexCount,
        gl.UNSIGNED_SHORT,
        indexOffset * 2
      )
    }
  }

}