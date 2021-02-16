import { Thing } from "../common/thing.class"
import { parseColor } from "../common/utils"

const { sin, cos, PI } = Math

export class EavesThing extends Thing {

  readonly vertex0: vec3
  readonly vertex1: vec3
  readonly vertex2: vec3
  readonly vertex3: vec3
  readonly vertex4: vec3
  readonly vertex5: vec3

  constructor(...vertices: vec3[]) {
    super()
    console.assert(vertices.length === 6, "must be 6 vertices")
    this.vertex0 = vertices[0]

    this.vertex1 = vertices[1]
    this.vertex2 = vertices[2]
    this.vertex3 = vertices[3]
    this.vertex4 = vertices[4]

    this.vertex5 = vertices[5]
  }

  make(): void {
    const color = parseColor("#795548")
    this.vertices.push(
      ...this.vertex0,  // left bottom
      ...this.vertex1, // left top
      ...this.vertex2, // right bottom
      ...this.vertex3, // right top
      ...this.vertex4,
      ...this.vertex5
    )

    this.colors.push(
      ...color,
      ...color,
      ...color,
      ...color,
      ...color,
      ...color,
    )
  }

  render(gl: WebGLRenderingContext): () => void {
    const { offset, VertexCount } = this
    return () => {
      gl.drawArrays(
        gl.TRIANGLE_STRIP, offset + 1, 4
      )
    }
  }

}