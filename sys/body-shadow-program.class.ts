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
    const { gl } = this
    gl.useProgram(this.program)

    return () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.depthFrameBuffer)

      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }
  }
}