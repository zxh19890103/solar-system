/**
 * idea.
 * 
 * as a body:
 * N vertices.
 * center: A center position [0, 0, 0] in the local coord system.
 * local matrix: A matrix to rotate the body by the Z axis of local coordinates system.
 * model matrix: A matrix to transform the position of the body into the world coord system.
 * 
 * What changes?
 * 1. local matrix for rotating.
 * 2. model matrix for translating.
 * 
 * What's immutable?
 * 1. N vertices
 * 2. the center.
 */
import { Earth, Jupiter, Mars, Mercury, Neptune, Saturn, Sun, Uranus, Venus } from "./body-info"
import { BodyProgram } from "./body-program.class"
import { Body } from "./body.class"
import { Camera } from "./camera.class"
import { CircleProgram } from "./circle-program.class"
import { Ether } from "./ether"
import { PointProgram } from "./point-program.class"
import { ObjectProgram } from "./program.class"
import { BallProgram } from "./ball-program.class"

let W: number = 0
let H: number = 0
let gl: WebGLRenderingContext
let cam: Camera
let ether: Ether
const frames = []

const setupGLContext = () => {
  const canvasElement = document.createElement("canvas")
  W = window.innerWidth
  H = window.innerHeight
  canvasElement.width = W
  canvasElement.height = H
  document.body.appendChild(canvasElement)
  gl = canvasElement.getContext("webgl")
}

const createProgram = async (body: Body) => {
  const program = new BodyProgram(gl, body)
  program.setCam(cam)
  program.setEther(ether)
  ether.put(body)
  await program.setup()
  frames.push(program.boot())
}

const run = () => {

  gl.blendFunc(
    gl.DST_COLOR,
    gl.SRC_COLOR
  )

  const loop = () => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)  // Clear to black, fully opaque
    gl.clearDepth(1.0)                 // Clear everything
    gl.enable(gl.DEPTH_TEST)           // Enable depth testing
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    for (const frame of frames) {
      frame()
    }

    requestAnimationFrame(loop)
  }
  loop()
}

const solar = async () => {
  setupGLContext()

  cam = new Camera(W / H)
  // 2492 mkm
  cam.put([
    0, 0, Earth.aphelion
  ], [
    0, 1, 0
  ]).adjust(
    Math.PI * .06,
    .1,
    Infinity
  )

  ether = new Ether()
  // ether.put(new Body(Sun, [0, 0, 0], [0, 0, 0]))
  // const mars = new Body(Mars, [0, 0, 0], [0, 0, 0])
  const sun = new Body(Sun, [0, 0, 0], [0, 0, 0])
  await createProgram(sun)

  run()
}

solar()