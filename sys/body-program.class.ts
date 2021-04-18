import { Earth } from "./body-info"
import { Body, RenderBodyAs } from "./body.class"
import { RAD_PER_DEGREE } from "./constants"
import { ObjectProgram } from "./program.class"

const {
  vec3,
  mat4
} = glMatrix

export class BodyProgram extends ObjectProgram {

  get vertexShaderSource() {
    return "/shaders/body.vert.glsl"
  }

  get fragmentShaderSource() {
    return "/shaders/body.frag.glsl"
  }

  async setup() {
    const gl = this.gl
    this.tex = await this.loadTexture(gl, this.body.inf.map)
    await super.setup()
  }

  private lightSource: Body = null
  setLightingSource(body: Body) {
    this.lightSource = body
  }

  boot() {
    const { gl, body } = this

    gl.useProgram(this.program)

    body.make(RenderBodyAs.Body)

    const { axialTilt, inclination } = body.inf
    glMatrix.mat4.rotate(
      body.localMat,
      body.localMat,
      inclination,
      [Math.cos(body.angleOnXY), Math.sin(body.angleOnXY), 0]
    )

    glMatrix.mat4.rotate(
      body.localMat,
      body.localMat,
      axialTilt,
      [1, 0, 0]
    )

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
      [.04, .04, .04]
    )()

    this.setUniform3fv(
      "uDirectionalLightColor",
      [1, 1, 1]
    )()

    const lightDir: vec3 = [0, 0, 0]

    const calculatesLightDir = () => {
      vec3.normalize(
        lightDir,
        [0, 0, 1]
        // vec3.sub(
        //   lightDir,
        //   body.coordinates,
        //   this.lightSource ? this.lightSource.coordinates : this.cam.coord
        // )
      )
    }

    calculatesLightDir()
    const setLightSource = this.setUniform3fv(
      "uLightDirection",
      lightDir
    )

    const normMatrix = m4.create()

    const createNormMatrix = () => {
      const mvMatrix = m4.create()
      m4.multiply(
        mvMatrix,
        this.body.modelMat,
        this.body.localMat,
      )

      m4.multiply(
        mvMatrix,
        this.cam.viewMat,
        mvMatrix,
      )

      m4.invert(
        normMatrix,
        mvMatrix
      )
      m4.transpose(
        normMatrix,
        normMatrix
      )
    }
    const setNormMatrix = this.setUniformMatrix4fv(
      "norm_matrix",
      normMatrix
    )

    // just once.
    const uniform = this.setUniformLMVP()
    const setSampler = this.setUniformTexSampler()
    const setIndices = this.bufferUInt16Array(body.indices)

    const { TRIANGLES, UNSIGNED_SHORT } = gl
    const indicesCount = body.indices.length

    const frame01 = () => {
      gl.useProgram(this.program)
      body.selfRotates()
      setIndices()
      setSampler()
      setVertices()
      setNormals()
      setTexCoords()
      calculatesLightDir()
      setLightSource()
      createNormMatrix()
      setNormMatrix()
      uniform()
      gl.drawElements(TRIANGLES, indicesCount, UNSIGNED_SHORT, 0)
    }

    return frame01
  }
}