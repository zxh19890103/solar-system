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

  setUniformLMVP() {
    const { cam, body } = this

    const l = this.setUniformMatrix4fv("local", body.localMat)
    const m = this.setUniformMatrix4fv("model", body.modelMat)

    const v = this.setUniformMatrix4fv("view", cam.viewMat)
    const p = this.setUniformMatrix4fv("projection", cam.projectionMat)

    cam.subscribe("v", () => {
      this.gl.useProgram(this.program)
      v()
    })

    cam.subscribe("p", () => {
      this.gl.useProgram(this.program)
      p()
    })

    v()
    p()

    return () => {
      l()
      m()
    }
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
        vec3.sub(
          lightDir,
          body.coordinates,
          this.lightSource ? this.lightSource.coordinates : this.cam.coord
        )
      )
    }

    calculatesLightDir()
    const setLightSource = this.setUniform3fv(
      "uLightDirection",
      lightDir
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
      uniform()
      gl.drawElements(TRIANGLES, indicesCount, UNSIGNED_SHORT, 0)
    }

    return frame01
  }
}