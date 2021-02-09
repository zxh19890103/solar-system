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
import { Ceres, Earth, Jupiter, Mars, Mercury, Neptune, Saturn, Sun, Uranus, Venus, Eris, Pluto, Halley, Tempel1, Holmes, HaleBopp } from "./body-info"
import { BodyProgram } from "./body-program.class"
import { Body } from "./body.class"
import { Camera } from "./camera.class"
import { CircleProgram } from "./circle-program.class"
import { Ether } from "./ether"
import { PointProgram } from "./point-program.class"
import { ObjectProgram } from "./program.class"
import { BallProgram } from "./ball-program.class"
import { AU } from "./constants"
import { debounce } from "./utils"

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
  return body
}

const run = () => {

  gl.enable(gl.BLEND)
  gl.blendFunc(
    gl.SRC_ALPHA,
    gl.ONE_MINUS_SRC_ALPHA
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
  const at: vec3 = [
    0, Mars.aphelion, Jupiter.aphelion
  ]
  // // 2492 mkm
  cam.adjust(
    Math.PI * .9,
    .1,
    Infinity
  )

  ether = new Ether()
  const distance = glMatrix.vec3.distance(
    at,
    [0, 0, 0]
  )
  ether.writeLine(`You're ${(distance / AU).toFixed(6)} AU far from the origin, the sun.`)
  await createProgram(new Body(Sun))
  // await createProgram(new Body(Mercury))
  // await createProgram(new Body(Venus))
  const earth = await createProgram(new Body(Earth))
  // await createProgram(new Body(Mars))
  // await createProgram(new Body(Jupiter))
  // await createProgram(new Body(Saturn))
  // await createProgram(new Body(Uranus))
  // const neptune = await createProgram(new Body(Neptune))

  // console.log(neptune.coordinates, d)
  const d = glMatrix.vec3.add(
    [0, 0, 0],
    earth.coordinates,
    [1, 0, 0]
  )
  // console.log(earth.coordinates, d)
  cam.put(d)
  cam.lookAt(earth)
  // await createProgram(new Body(Ceres))
  // await createProgram(new Body(Eris))
  // await createProgram(new Body(Pluto))

  // await createProgram(new Body(Halley))
  // await createProgram(new Body(Tempel1))
  // await createProgram(new Body(Holmes))
  // await createProgram(new Body(HaleBopp))

  // gl.canvas.addEventListener("mousemove", debounce((evt: MouseEvent) => {
  //   const { offsetX, offsetY } = evt
  //   const x = offsetX - W / 2
  //   const y = offsetY - H / 2
  //   console.log(x, y)
  //   cam.rotate(Math.atan(y / x))
  // }))

  run()
}

solar()