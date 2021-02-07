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
    const { gl, program, cam } = this

    gl.useProgram(program)

    this.setUniform4fv("uVertexColor", parseColor(this.body.inf.color))()
    this.setUniform1f("uVertexSize", this.body.inf.radius)()

    const setAttrib = this.setFloat32Attrib(
      "aVertex",
      [...this.body.center],
      3
    )

    this.setUniformMatrix4fv("view", cam.viewMat)()
    this.setUniformMatrix4fv("projection", cam.projectionMat)()

    // let alpha = 1

    return () => {
      gl.useProgram(program)
      setAttrib()
      gl.drawArrays(
        gl.POINTS, 0, 1
      )
    }
  }

}