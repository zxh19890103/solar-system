import { RenderBodyAs } from "./body.class"
import { ObjectProgram } from "./program.class"

export class CircleProgram extends ObjectProgram {

  get vertexShaderSource(): string {
    return "/shaders/circle.vert.glsl"
  }
  get fragmentShaderSource(): string {
    return "/shaders/circle.frag.glsl"
  }

  async setup() {
    this.log("initializing...")
    const gl = this.gl
    this.tex = await this.loadTexture(gl, this.body.inf.avatar)
    await super.setup()
    this.log("initialized")
  }

  boot(): () => void {
    const { gl, program, body, ether } = this
    const inf = body.inf

    gl.useProgram(program)

    body.make(RenderBodyAs.Circle)

    const setAttrib = this.setFloat32Attrib(
      "aVertex",
      body.vertices,
      3
    )

    const setTexCoords = this.setFloat32Attrib(
      "aVertexTexCoord",
      body.texCoords,
      2
    )
    const setSampler = this.setUniformTexSampler()
    const setIndices = this.bufferUInt16Array(body.indices)

    const { TRIANGLES, UNSIGNED_SHORT } = gl
    const indicesCount = body.indices.length

    const uniform = this.setUniformLMVP()

    return () => {
      gl.useProgram(program)
      body.selfRotates()
      setIndices()
      setAttrib()
      setSampler()
      setTexCoords()
      uniform()
      gl.drawElements(TRIANGLES, indicesCount, UNSIGNED_SHORT, 0)
    }
  }

}