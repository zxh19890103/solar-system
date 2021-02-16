import { Thing } from "../common/thing.class"
import { parseColor, randColor } from "../common/utils"
import { HornThing } from "./horn.class"

export class WindowThing extends Thing {

  readonly horns: HornThing[]
  readonly height: number

  constructor(h: number, ...horns12: HornThing[]) {
    super()
    this.horns = horns12
    this.height = h
  }

  make(): void {
    const color = parseColor("#373430")
    color[3] = 1
    for (let i = 0; i < 13; i++) {
      const horn = this.horns[i % 12]
      const origin = horn.getVertex(3)
      this.vertices.push(
        origin[0], origin[1], origin[2],
        origin[0], origin[1], origin[2] - this.height
      )
      this.colors.push(...color, ...color)
    }
  }

  render(gl: WebGLRenderingContext): () => void {
    const { offset, VertexCount } = this
    return () => {
      gl.drawArrays(
        gl.TRIANGLE_STRIP,
        offset,
        VertexCount
      )
    }
  }

}