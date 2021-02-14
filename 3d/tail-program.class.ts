import { RenderBodyAs } from "./body.class"
import { AU } from "./constants"
import { ObjectProgram } from "./program.class"
import { range } from "./utils"

export class TailProgram extends ObjectProgram {

  get vertexShaderSource(): string {
    return "/shaders/tail.vert.glsl"
  }
  get fragmentShaderSource(): string {
    return "/shaders/tail.frag.glsl"
  }

  boot(): () => void {
    const { gl, program, body } = this

    gl.useProgram(program)

    body.make(RenderBodyAs.Tails)

    const setVertices = this.setFloat32Attrib(
      "aVertex",
      body.vertices,
      3
    )

    const setVertexColors = this.setFloat32Attrib(
      "aVertexColor",
      body.colors,
      4
    )

    const setFar = this.setUniform1f("far", glMatrix.vec3.len(body.coordinates))

    this.setUniformLMVP(false, false)

    const rotation = glMatrix.mat4.create()
    const changeRotation = () => {
      glMatrix.mat4.targetTo(
        rotation,
        body.coordinates,
        [0, 0, 0],
        [0, 1, 0]
      )
    }

    const uni = this.setUniformMatrix4fv("rotation", rotation)

    const verticesCount = body.vertices.length / 3

    return () => {
      const far = glMatrix.vec3.len(body.coordinates)
      gl.useProgram(program)
      setVertices()
      setVertexColors()
      changeRotation()
      uni()
      setFar(AU * AU * AU * 5 / (far * far * far))
      gl.drawArrays(
        gl.POINTS, 0, verticesCount
      )
    }
  }

}