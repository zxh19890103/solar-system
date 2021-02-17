import { Thing } from "../common/thing.class"


export class EavesThing extends Thing {

  readonly vertex0: vec3
  readonly vertex1: vec3
  readonly vertex2: vec3
  readonly vertex3: vec3

  constructor(...four: vec3[]) {
    super()
    console.assert(four.length === 4, "must be 4")
    this.vertex0 = four[0]
    this.vertex1 = four[1]
    this.vertex2 = four[2]
    this.vertex3 = four[3]
  }

  make(): void {
    this.pushVertex(
      ...this.vertex0,
      ...this.vertex1,
      ...this.vertex2,
      ...this.vertex3
    )
  }

  render(gl: WebGLRenderingContext): () => void {
    const { offset, VertexCount } = this
    return () => {
      gl.drawArrays(
        gl.LINE_LOOP,
        offset,
        VertexCount
      )
    }
  }
}