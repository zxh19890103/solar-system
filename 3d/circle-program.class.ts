import { ObjectProgram } from "./program.class"

export class CircleProgram extends ObjectProgram {

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
      body.rotates(.001)
      gl.useProgram(program)
      setAttrib()
      uniform()
      ether.move(body)
      gl.drawArrays(
        gl.POINTS, 0, pointsCount
      )
    }
  }

}