import { Body } from "./body.class"
import { Camera } from "./camera.class"
import { Ether } from "./ether"

export class BodyProgram {

  readonly gl: WebGLRenderingContext
  private program: WebGLProgram

  private vertexShader: string
  private fragmentShader: string

  private tex: WebGLTexture

  private body: Body
  private cam: Camera
  private ether: Ether

  constructor(gl: WebGLRenderingContext, body: Body, vertexShader: string, fragmentShader: string) {
    this.gl = gl
    this.body = body
    this.vertexShader = vertexShader
    this.fragmentShader = fragmentShader
  }

  log(...data: unknown[]) {
    console.log("program: ", ...data)
  }

  async initialize() {
    this.log("initializing...")
    const gl = this.gl

    this.tex = await this.loadTexture(gl, this.body.inf.map)
    this.vertexShader = await this.loadRemoteShaderCode("/shaders/vertex.glsl")
    this.fragmentShader = await this.loadRemoteShaderCode("/shaders/fragment.glsl")

    this.program = this.initShaderProgram()
    this.log("initialized")
  }

  private initShaderProgram() {
    const gl = this.gl
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, this.vertexShader)
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, this.fragmentShader)

    // Create the shader program
    const shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram))
      return null
    }

    return shaderProgram
  }

  private loadShader(type, source) {
    const gl = this.gl

    const shader = gl.createShader(type)

    // Send the source to the shader object

    gl.shaderSource(shader, source)

    // Compile the shader program

    gl.compileShader(shader)

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }

    return shader
  }

  private loadRemoteShaderCode(url: string) {
    return fetch(url).then(
      (resp) => {
        return resp.text()
      }
    )
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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
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

  private setFloat32Attrib(data: number[], attribName: string, pointerSize: number) {
    const { gl, program } = this
    const farray = new Float32Array(data)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, farray, gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, attribName)

    return () => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.vertexAttribPointer(
        loc, pointerSize, gl.FLOAT, false, 0, 0
      )
      gl.enableVertexAttribArray(loc)
    }
  }

  private setUniform3fv(name: string, value: Iterable<number>) {
    const { gl, program } = this
    const loc = gl.getUniformLocation(program, name)
    gl.uniform3fv(loc, value)
    return () => {
      gl.uniform3fv(loc, value)
    }
  }

  private setUniformMatrix4fv(name: string, mat: mat4) {
    const { gl, program } = this
    const loc = gl.getUniformLocation(program, name)
    return () => {
      gl.uniformMatrix4fv(loc, false, mat)
    }
  }

  private setUniformSampler() {
    const gl = this.gl
    gl.activeTexture(gl.TEXTURE0)
    const loc = gl.getUniformLocation(this.program, "uSampler")
    gl.uniform1i(loc, 0)
    return () => {
      gl.uniform1i(loc, 0)
    }
  }

  private bufferIndices(indices: number[]) {
    const gl = this.gl
    const indicesBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
    return () => {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
    }
  }

  setCam(cam: Camera) {
    this.cam = cam
  }

  setBody(body: Body) {
    this.body = body
  }

  setEther(ether: Ether) {
    this.ether = ether
  }

  async boot() {
    const { gl, body, cam } = this

    await this.initialize()

    gl.useProgram(this.program)

    body.make()

    const setattr01 = this.setFloat32Attrib(
      body.vertices,
      "aVertex",
      3
    )

    const setattr02 = this.setFloat32Attrib(
      body.texCoords,
      "aVertexTexCoord",
      2
    )

    const setattr03 = this.setFloat32Attrib(
      body.normals,
      "aVertexNormal",
      3
    )

    this.setUniform3fv(
      "uAmbientLight",
      [.4, .4, .5]
    )

    this.setUniform3fv(
      "uDirectionalLightColor",
      [1, 1, 1]
    )

    this.setUniform3fv(
      "uLightDirection",
      [0, 0, 1]
    )

    const uniformLocal = this.setUniformMatrix4fv(
      "local",
      body.localMat
    )

    const uniformModel = this.setUniformMatrix4fv(
      "model",
      body.modelMat
    )
    uniformModel()

    this.setUniformMatrix4fv("view", cam.viewMat)()
    this.setUniformMatrix4fv("projection", cam.projectionMat)()

    this.setUniformSampler()

    this.bufferIndices(body.indices)

    const { TRIANGLES, UNSIGNED_SHORT } = gl
    const indicesCount = body.indices.length

    const tick = () => {
      body.rotates(.01)
      gl.useProgram(this.program)
      gl.bindTexture(gl.TEXTURE_2D, this.tex)
      setattr01()
      setattr02()
      setattr03()
      uniformLocal()
      this.ether.moveBody(body)
      uniformModel()
      gl.drawElements(TRIANGLES, indicesCount, UNSIGNED_SHORT, 0)
    }

    return tick
  }
}