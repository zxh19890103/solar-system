import { ShaderProgram } from "./shader-program.class"

let W: number = 0
let H: number = 0
let gl: WebGL2RenderingContext
let canvas: HTMLCanvasElement

const setupGLContext = () => {
  const canvasElement = document.createElement("canvas")
  W = window.innerWidth
  H = window.innerHeight
  canvasElement.width = W
  canvasElement.height = H
  document.body.appendChild(canvasElement)
  canvas = canvasElement
  gl = canvasElement.getContext("webgl2")
  gl.viewport(0, 0, W, H)
}

setupGLContext()

const main = async () => {
  const program = new ShaderProgram(gl)

  await program.attchShader("/shaders/earth.vert.glsl", gl.VERTEX_SHADER)
  await program.attchShader("/shaders/earth.frag.glsl", gl.FRAGMENT_SHADER)
  await program.attchShader("/shaders/earth.tcs.glsl", 0)
  await program.attchShader("/shaders/earth.tes.glsl", 0)

  program.linkToGL()
}
