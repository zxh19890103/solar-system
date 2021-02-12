import { RenderBodyAs } from "./body.class"
import { ObjectProgram } from "./program.class"
import { range } from "./utils"

export class OrbitProgram extends ObjectProgram {

  get vertexShaderSource(): string {
    return "/shaders/orbit.vert.glsl"
  }
  get fragmentShaderSource(): string {
    return "/shaders/orbit.frag.glsl"
  }

  boot(): () => void {
    const { gl, program, body, ether } = this
    const inf = body.inf
    const { PI, sin } = Math

    gl.useProgram(program)

    body.make(RenderBodyAs.Orbit)

    const color = [...inf.color]
    const setColor = this.setUniform4fv("uVertexColor", color)
    this.setUniform1f("uVertexSize", inf.radius)()

    const setOrbit = this.setFloat32Attrib(
      'aVertex',
      [],
      3
    )

    this.setUniformLMVP()()

    return () => {
      gl.useProgram(program)
      setColor()
      ether.move(body)
      body.collectOrbitalCoords(body.coordinates)
      setOrbit(body.orbitalCoordinates)
      gl.drawArrays(
        gl.POINTS, 0, body.orbitalCoordinateCount
      )
    }
  }

}