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
import { Ether } from "./ether"

let W: number = 0
let H: number = 0
let gl: WebGLRenderingContext
let cam: Camera
let ether: Ether
const frames = []

const setUpGLContext = () => {
  const canvasElement = document.createElement("canvas")
  W = window.innerWidth
  H = window.innerHeight
  canvasElement.width = W
  canvasElement.height = H
  document.body.appendChild(canvasElement)
  gl = canvasElement.getContext("webgl")
}

const createProgram = async (body: Body) => {
  const program = new BodyProgram(
    gl,
    body,
    "/shaders/vertex.glsl",
    "/shaders/fragment.glsl"
  )
  program.setCam(cam)
  program.setEther(ether)
  ether.put(body)
  frames.push(await program.boot())
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

const eight = async () => {
  setUpGLContext()

  cam = new Camera(W / H)
  cam.put([
    0, Jupiter.radius * 10, Jupiter.radius * 6
  ], [
    0, 0, 1
  ]).adjust(
    Math.PI * .1,
    .1,
    Jupiter.radius * 20
  )

  let offset = Jupiter.radius * 3.5

  await createProgram(new Body(
    Mercury, [offset -= 20, 0, 0]
  ))
  await createProgram(new Body(
    Venus, [offset -= 20, 0, 0]
  ))
  await createProgram(new Body(
    Earth, [offset -= 20, 0, 0]
  ))
  await createProgram(new Body(
    Mars, [offset -= 20, 0, 0]
  ))
  await createProgram(new Body(
    Jupiter, [offset -= Jupiter.radius + 10, 0, 0]
  ))
  await createProgram(new Body(
    Saturn, [offset -= Jupiter.radius + Saturn.radius + 10, 0, 0]
  ))
  await createProgram(new Body(
    Uranus, [offset -= Saturn.radius + Uranus.radius + 10, 0, 0]
  ))
  await createProgram(new Body(
    Neptune, [offset -= Uranus.radius + Neptune.radius + 10, 0, 0]
  ))

  console.log('it\'s working.')

  run()
}

const solar = async () => {
  setUpGLContext()

  cam = new Camera(W / H)
  cam.put([
    0, 0, Mars.aphelion / 200
  ], [
    0, 1, 0
  ]).adjust(
    Math.PI * .98,
    .1,
    Jupiter.aphelion
  )

  ether = new Ether()
  // ether.put(new Body(Sun, [0, 0, 0], [0, 0, 0]))

  await createProgram(new Body(Earth, [Earth.aphelion, 0, 0], [0, 29.78 * .001, 0]))

  run()
}

solar()