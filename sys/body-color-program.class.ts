import { Earth, Luna } from "./body-info"
import { BodyShadowProgram } from "./body-shadow-program.class"
import { Body, RenderBodyAs } from "./body.class"
import { AU, RAD_PER_DEGREE } from "./constants"
import { ObjectProgram } from "./program.class"

export class BodyColorProgram extends ObjectProgram {

  bodyShadowProgram: BodyShadowProgram

  get vertexShaderSource() {
    return "/shaders/body-color.vert.glsl"
  }

  get fragmentShaderSource() {
    return "/shaders/body-color.frag.glsl"
  }

  async setup() {
    const gl = this.gl
    this.tex = await this.loadTexture(gl, this.body.inf.map)
    await super.setup()
  }

  boot() {
    const { gl, body } = this

    gl.useProgram(this.program)

    body.make(RenderBodyAs.Body)
    this.bodyShadowProgram = body.programs.find(x => x instanceof BodyShadowProgram) as BodyShadowProgram

    this.setUniformLMVP(false, true)()

    const camMatrix = m4.create()
    const cam2Matrix = m4.create()

    mat4.perspective(
      cam2Matrix,
      4 * RAD_PER_DEGREE,
      .2,
      1,
      3
    )

    m4.lookAt(
      camMatrix,
      v3.fromValues(Luna.aphelion, 0, 0),
      body.coordinates,
      [0, 1, 0]
    )

    const setCamMatrix = this.setUniformMatrix4fv("u_cam", camMatrix)
    const setCam2Matrix = this.setUniformMatrix4fv("u_cam2", cam2Matrix)

    const setVertices = this.setFloat32Attrib(
      "aVertex",
      body.vertices,
      3
    )

    const setTexCoords = this.setFloat32Attrib(
      "aVertexTexCoord",
      body.texCoords,
      2
    )

    // just once.
    const setSampler = this.setUniformTexSampler()
    const setIndices = this.bufferUInt16Array(body.indices)

    const indicesCount = body.indices.length

    return () => {
      gl.useProgram(this.program)
      body.selfRotates()
      setCamMatrix()
      setCam2Matrix()
      setIndices()
      setSampler()
      setVertices()
      setTexCoords()
      gl.drawElements(gl.TRIANGLES, indicesCount, gl.UNSIGNED_SHORT, 0)
    }
  }
}