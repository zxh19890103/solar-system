import { RenderBodyAs } from "./body.class"
import { RAD_PER_DEGREE } from "./constants"
import { ObjectProgram } from "./program.class"

export class BodyShadowProgram extends ObjectProgram {

  private depthFrameBuffer: WebGLFramebuffer

  get vertexShaderSource() {
    return "/shaders/body-shadow.vert.glsl"
  }

  get fragmentShaderSource() {
    return "/shaders/body-shadow.frag.glsl"
  }

  async setup() {
    await super.setup()
    this.createFrameBuffer()
  }

  createFrameBuffer(size = 512) {
    const { gl } = this
    const ext = gl.getExtension("WEBGL_depth_texture")
    if (!ext) {
      alert("Need WEBGL_depth_texture")
      return
    }
    // depth texture
    const depthTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, depthTexture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.DEPTH_COMPONENT,
      size,
      size,
      0,
      gl.DEPTH_COMPONENT,
      gl.UNSIGNED_INT,
      null
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    const depthFrameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFrameBuffer)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      depthTexture,
      0
    )

    // color texure
    const unusedTexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, unusedTexture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      size,
      size,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null,
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    // attach it to the framebuffer
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,        // target
      gl.COLOR_ATTACHMENT0,  // attachment point
      gl.TEXTURE_2D,         // texture target
      unusedTexture,         // texture
      0)                    // mip level

    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    this.depthFrameBuffer = depthFrameBuffer
  }

  boot() {
    const { gl, body } = this
    gl.useProgram(this.program)

    body.make(RenderBodyAs.Body)

    const projMatrix = mat4.create()
    mat4.perspective(
      projMatrix,
      45 * RAD_PER_DEGREE,
      1 / 1,
      1,
      1000
    )
    const viewMatrix = mat4.create()
    mat4.lookAt(
      viewMatrix,
      [0, 0, 0],
      body.coordinates,
      [0, 1, 0]
    )

    this.setUniformMatrix4fv("projection", projMatrix)()
    this.setUniformMatrix4fv("view", projMatrix)()
    const setModelMatrix = this.setUniformMatrix4fv("model", body.modelMat)

    const setVertices = this.setFloat32Attrib(
      "aVertex",
      body.vertices,
      3
    )
    const setIndices = this.bufferUInt16Array(body.indices)

    const indicesCount = body.indices.length

    return () => {
      gl.useProgram(this.program)
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFrameBuffer)
      setVertices()
      setIndices()
      setModelMatrix()
      gl.drawElements(gl.TRIANGLES, indicesCount, gl.UNSIGNED_SHORT, 0)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }
  }
}