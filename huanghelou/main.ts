import { Camera } from "../common/camera.class"
import { ObjectProgram } from "../common/program.class"
import { HuanghelouProgram } from "./huanghelou.program"

const programs: ObjectProgram[] = []
let W: number = 0
let H: number = 0
let gl: WebGLRenderingContext
let cam: Camera

const setupGLContext = () => {
  const canvasElement = document.createElement("canvas")
  W = window.innerWidth
  H = window.innerHeight
  canvasElement.width = W
  canvasElement.height = H
  document.body.appendChild(canvasElement)
  gl = canvasElement.getContext("webgl")
  gl.viewport(0, 0, W, H)
}

const addProgram = async (prog: ObjectProgram) => {
  programs.push(prog)
  await prog.init()
}

const run = async () => {
  gl.enable(gl.BLEND)
  gl.blendFunc(
    gl.SRC_ALPHA,
    gl.ONE_MINUS_SRC_ALPHA
  )

  gl.enable(gl.DEPTH_TEST)           // Enable depth testing
  gl.depthFunc(gl.LEQUAL)

  const drawcalls = programs.map(prog => prog.getTick())

  const loop = () => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)  // Clear to black, fully opaque
    gl.clearDepth(1.0)                 // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    for (const drawcall of drawcalls) drawcall()
    requestAnimationFrame(loop)
  }

  loop()
}

const main = async () => {
  setupGLContext()
  cam = new Camera(W / H)
  cam.put([
    0, -10, .2
  ]).lookAt([0, 0, 0])
    .adjust(
      Math.PI * (100 / 180),
      2,
      Infinity
    )
  await addProgram(new HuanghelouProgram(gl, cam))
  run()
}

main()