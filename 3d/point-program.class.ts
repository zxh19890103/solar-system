import { ObjectProgram } from "./program.class"
import { range } from "./utils"

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
    const { PI, sin } = Math

    gl.useProgram(program)

    body.make()

    const color = [...inf.color]
    const setColor = this.setUniform4fv("uVertexColor", color)
    this.setUniform1f("uVertexSize", inf.radius)()

    const setAttrib = this.setFloat32Attrib(
      "aVertex",
      body.vertices,
      3
    )

    let alpha = 0 ^ range(0, PI) * 100

    const uniform = this.setUniformLMVP()

    return () => {
      gl.useProgram(program)
      color[3] = sin((alpha % 314) * .01)
      setAttrib()
      setColor()
      uniform()
      ether.move(body)
      alpha += 3
      gl.drawArrays(
        gl.POINTS, 0, 1
      )
    }
  }

}