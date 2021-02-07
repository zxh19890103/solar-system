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
    const { gl, program, cam, body } = this
    const { cos, PI, sin } = Math
    const inf = body.inf

    gl.useProgram(program)

    this.setUniform4fv("uVertexColor", parseColor(inf.color))()

    const vertices = []
    const R = inf.radius
    let z = 0
    for (z = - PI / 2; z <= PI / 2; z += .17) {
      const r = R * cos(z)
      const h = R * sin(z)
      for (let a = 0, end = PI * 2; a < end; a += .17) {
        vertices.push(
          r * cos(a),
          r * sin(a),
          h
        )
      }
    }

    const setAttrib = this.setFloat32Attrib(
      "aVertex",
      vertices,
      3
    )

    const uniform = this.setUniformMatrix4fv("local", body.localMat)
    this.setUniformMatrix4fv("view", cam.viewMat)()
    this.setUniformMatrix4fv("projection", cam.projectionMat)()

    const pointsCount = vertices.length / 3

    return () => {
      body.rotates(.01)
      gl.useProgram(program)
      setAttrib()
      uniform()
      gl.drawArrays(
        gl.LINES, 0, pointsCount
      )
    }
  }

}