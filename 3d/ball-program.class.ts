import { Body } from "./body.class"
import { ObjectProgram } from "./program.class"
import { parseColor } from "./utils"

export class BallProgram extends ObjectProgram {

  constructor(gl: WebGLRenderingContext, body: Body) {
    super(gl, body)
  }

  get vertexShaderSource(): string {
    return "/shaders/point.vert.glsl"
  }
  get fragmentShaderSource(): string {
    return "/shaders/point.frag.glsl"
  }

  boot(): () => void {
    const { gl, program, ether, body } = this
    const inf = body.inf

    gl.useProgram(program)

    body.make()

    const color = [...inf.color]
    this.setUniform4fv("uVertexColor", color)()

    const setAttrib = this.setFloat32Attrib(
      "aVertex",
      body.vertices,
      3
    )

    const uniform = this.setUniformLMVP()

    const pointsCount = body.vertices.length / 3

    return () => {
      body.rotates(.01)
      gl.useProgram(program)
      setAttrib()
      uniform()
      ether.move(body)
      gl.drawArrays(
        gl.LINES, 0, pointsCount
      )
    }
  }

}