import { ObjectProgram } from "./program.class"
import { isPowerOfTwo } from "./utils"

export class BodyProgram extends ObjectProgram {

  get vertexShaderSource() {
    return "/shaders/body.vert.glsl"
  }

  get fragmentShaderSource() {
    return "/shaders/body.frag.glsl"
  }

  private tex: WebGLTexture

  log(...data: unknown[]) {
    console.log("program: ", ...data)
  }

  async setup() {
    this.log("initializing...")
    const gl = this.gl
    this.tex = await this.loadTexture(gl, this.body.inf.map)
    await super.setup()
    this.log("initialized")
  }

  async loadTexture(gl: WebGLRenderingContext, url: string) {
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    const img = await this.loadImage(url)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // level
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      img
    )

    if (isPowerOfTwo(img.naturalWidth) && isPowerOfTwo(img.naturalHeight)) {
      gl.generateMipmap(gl.TEXTURE_2D)
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    }
    return tex
  }

  private loadImage(url: string) {
    return new Promise<HTMLImageElement>((done, fail) => {
      const img = new Image()
      img.onload = () => {
        done(img)
      }
      img.onerror = fail
      img.src = url
    })
  }

  private setUniformTexSampler() {
    const gl = this.gl
    gl.activeTexture(gl.TEXTURE0)
    const loc = gl.getUniformLocation(this.program, "uSampler")
    gl.uniform1i(loc, 0)
    return () => {
      gl.bindTexture(gl.TEXTURE_2D, this.tex)
      gl.activeTexture(gl.TEXTURE0)
      gl.uniform1i(loc, 0)
    }
  }

  boot() {
    const { gl, body, ether } = this

    gl.useProgram(this.program)

    body.make()

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

    this.bufferUInt16Array(body.indices)

    const { TRIANGLES, UNSIGNED_SHORT } = gl
    const indicesCount = body.indices.length

    return () => {
      body.rotates(.01)
      gl.useProgram(this.program)
      setSampler()
      setVertices()
      setNormals()
      setTexCoords()
      ether.move(body)
      uniform()
      gl.drawElements(TRIANGLES, indicesCount, UNSIGNED_SHORT, 0)
    }
  }
}