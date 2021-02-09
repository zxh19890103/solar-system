import { Ether } from "./ether"
import { Camera } from "./camera.class"
import { Body } from "./body.class"

export abstract class ObjectProgram {
  readonly gl: WebGLRenderingContext
  protected program: WebGLProgram
  /**
   * the url of vertex shader code source
   */
  abstract get vertexShaderSource(): string
  /**
   *  the url of fragment shader code source
    */
  abstract get fragmentShaderSource(): string

  abstract boot(): () => void

  constructor(gl: WebGLRenderingContext, body: Body) {
    this.gl = gl
    this.body = body
  }

  async setup() {
    const vsCode = await this.loadRemoteShaderCode(this.vertexShaderSource)
    const fsCode = await this.loadRemoteShaderCode(this.fragmentShaderSource)

    this.initShaderProgram(vsCode, fsCode)

    // link program in the next mircotasks together..
    // await this.link()
  }

  protected initShaderProgram(vsCode: string, fsCode: string) {
    const gl = this.gl

    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsCode)
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsCode)

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

    this.program = shaderProgram
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

  protected setFloat32Attrib(attribName: string, data: number[], pointerSize: number) {
    const { gl, program } = this
    const farray = new Float32Array(data)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, farray, gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, attribName)

    return () => {
      // ????
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.vertexAttribPointer(
        loc, pointerSize, gl.FLOAT, false, 0, 0
      )
      gl.enableVertexAttribArray(loc)
    }
  }

  /**
   * no GPU upload.
   */
  protected bufferUInt16Array(int16Array: number[]) {
    const gl = this.gl
    const indicesBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(int16Array), gl.STATIC_DRAW)
    return () => {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
    }
  }

  protected setUniform3fv(name: string, value: Iterable<number>) {
    const { gl, program } = this
    const loc = gl.getUniformLocation(program, name)
    return () => {
      gl.uniform3fv(loc, value)
    }
  }

  protected setUniform4fv(name: string, value: Iterable<number>) {
    const { gl, program } = this
    const loc = gl.getUniformLocation(program, name)
    return (nextValue?: Iterable<number>) => {
      gl.uniform4fv(loc, nextValue ?? value)
    }
  }

  protected setUniform1f(name: string, value: number) {
    const { gl, program } = this
    const loc = gl.getUniformLocation(program, name)
    return (nextValue?: number) => {
      gl.uniform1f(loc, nextValue ?? value)
    }
  }

  protected setUniformMatrix4fv(name: string, mat: mat4) {
    const { gl, program } = this
    const loc = gl.getUniformLocation(program, name)
    return () => {
      gl.uniformMatrix4fv(loc, false, mat)
    }
  }

  cam: Camera
  setCam(cam: Camera) {
    this.cam = cam
  }

  ether: Ether
  setEther(ether: Ether) {
    this.ether = ether
  }

  body: Body
  setBody(body: Body) {
    this.body = body
  }

  protected setUniformLMVP() {
    const { cam, body } = this
    const l = this.setUniformMatrix4fv("local", body.localMat)
    const m = this.setUniformMatrix4fv("model", body.modelMat)
    const v = this.setUniformMatrix4fv("view", cam.viewMat)
    this.setUniformMatrix4fv("projection", cam.projectionMat)()
    m()
    return () => {
      l()
      m()
      v()
    }
  }
}