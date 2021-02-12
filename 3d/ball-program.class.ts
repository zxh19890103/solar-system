import { RenderBodyAs } from "./body.class"
import { ObjectProgram } from "./program.class"

export class BallProgram extends ObjectProgram {

  get vertexShaderSource(): string {
    return "/shaders/ball.vert.glsl"
  }
  get fragmentShaderSource(): string {
    return "/shaders/ball.frag.glsl"
  }

  boot(): () => void {
    const { gl, program, ether, body } = this
    const inf = body.inf

    gl.useProgram(program)

    body.make(RenderBodyAs.Ball)

    const setVertices = this.setFloat32Attrib(
      "aVertex",
      body.vertices,
      3
    )

    const setColors = this.setFloat32Attrib(
      "aVertexColor",
      body.colors,
      4
    )

    const uniform = this.setUniformLMVP()

    this.bufferUInt16Array(body.indices)
    const indicesCount = body.indices.length

    return () => {
      body.rotates(.01)
      gl.useProgram(program)
      setVertices()
      setColors()
      uniform()
      ether.move(body)
      gl.drawElements(
        gl.TRIANGLES, indicesCount, gl.UNSIGNED_SHORT, 0
      )
    }
  }

}