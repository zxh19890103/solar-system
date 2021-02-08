import { ObjectProgram } from "./program.class"
import { parseColor } from "./utils"

export class PointProgram extends ObjectProgram {

  get vertexShaderSource(): string {
    return "/shaders/point.vert.glsl"
  }
  get fragmentShaderSource(): string {
    return "/shaders/point.frag.glsl"
  }

  boot(): () => void {
    const { gl, program, body, ether } = this
    const inf = body.inf

    gl.useProgram(program)

    this.setUniform4fv("uVertexColor", inf.color)()
    this.setUniform1f("uVertexSize", inf.radius)()

    const setAttrib = this.setFloat32Attrib(
      "aVertex",
      [0, 0, 0],
      3
    )

    const uniform = this.setUniformLMVP()

    return () => {
      gl.useProgram(program)
      setAttrib()
      uniform()
      ether.move(body)
      gl.drawArrays(
        gl.POINTS, 0, 1
      )
    }
  }

}