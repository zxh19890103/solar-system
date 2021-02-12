import { RenderBodyAs } from "./body.class"
import { ObjectProgram } from "./program.class"

export class RingsProgram extends ObjectProgram {

  get vertexShaderSource() {
    return "/shaders/rings.vert.glsl"
  }

  get fragmentShaderSource() {
    return "/shaders/rings.frag.glsl"
  }

  boot() {
    const { gl, body, ether } = this

    gl.useProgram(this.program)

    body.make(RenderBodyAs.Rings)

    const setColors = this.setFloat32Attrib(
      "aVertexColor",
      body.colors,
      4
    )

    const setVertices = this.setFloat32Attrib(
      "aVertex",
      body.vertices,
      4
    )

    // just once.
    const uniform = this.setUniformLMVP()
    const indicesCount = body.vertices.length / 4

    const frame01 = () => {
      body.rotates(.01)
      gl.useProgram(this.program)
      setVertices()
      setColors()
      ether.move(body)
      uniform()
      gl.drawArrays(gl.POINTS, 0, indicesCount)
    }

    return frame01
  }
}