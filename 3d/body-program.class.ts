import { RenderBodyAs } from "./body.class"
import { ObjectProgram } from "./program.class"

export class BodyProgram extends ObjectProgram {

  get vertexShaderSource() {
    return "/shaders/body.vert.glsl"
  }

  get fragmentShaderSource() {
    return "/shaders/body.frag.glsl"
  }

  async setup() {
    this.log("initializing...")
    const gl = this.gl
    this.tex = await this.loadTexture(gl, this.body.inf.map)
    await super.setup()
    this.log("initialized")
  }

  boot() {
    const { gl, body, ether } = this

    gl.useProgram(this.program)

    body.make(RenderBodyAs.Body)

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

    const setNormals = this.setFloat32Attrib(
      "aVertexNormal",
      body.normals,
      3
    )

    this.setUniform3fv(
      "uAmbientLight",
      [.4, .4, .5]
    )()

    this.setUniform3fv(
      "uDirectionalLightColor",
      [1, 1, 1]
    )()

    this.setUniform3fv(
      "uLightDirection",
      [0, 0, 1]
    )()

    // just once.
    const uniform = this.setUniformLMVP()
    const setSampler = this.setUniformTexSampler()
    const setIndices = this.bufferUInt16Array(body.indices)

    const { TRIANGLES, UNSIGNED_SHORT } = gl
    const indicesCount = body.indices.length

    const frame01 = () => {
      body.rotates(.01)
      gl.useProgram(this.program)
      setIndices()
      setSampler()
      setVertices()
      setNormals()
      setTexCoords()
      uniform()
      gl.drawElements(TRIANGLES, indicesCount, UNSIGNED_SHORT, 0)
    }

    return frame01
  }
}