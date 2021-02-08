import { Body } from "./body.class"
import { ObjectProgram } from "./program.class"
import { parseColor } from "./utils"

export class CircleProgram extends ObjectProgram {

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
    const { gl, program, body } = this
    const { cos, PI, sin } = Math
    const inf = body.inf

    gl.useProgram(program)

    const vertices = []
    const r = inf.radius
    for (let a = 0, end = PI * 2; a < end; a += .17) {
      vertices.push(
        r * cos(a),
        r * sin(a),
        0
      )
    }

    const setAttrib = this.setFloat32Attrib(
      "aVertex",
      vertices,
      3
    )

    const uniform = this.setUniformLMVP()

    const pointsCount = vertices.length / 3

    return () => {
      body.rotates(.001)
      gl.useProgram(program)
      setAttrib()
      uniform()
      gl.drawArrays(
        gl.LINE_LOOP, 0, pointsCount
      )
    }
  }

}