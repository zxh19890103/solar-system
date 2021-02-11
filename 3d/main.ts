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
import { Ceres, Earth, Jupiter, Mars, Mercury, Neptune, Saturn, Sun, Uranus, Venus, Eris, Pluto, Halley, Tempel1, Holmes, HaleBopp, Luna, Lo, Europa, Ganymede, Callisto, Titan, Rhea } from "./body-info"
import { BodyProgram } from "./body-program.class"
import { Body, BodyLooksLike } from "./body.class"
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
const programs: ObjectProgram[] = []
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

const createProgram = async (body: Body, bodyShape = BodyLooksLike.Point) => {
  let program: ObjectProgram = null
  {
    switch (bodyShape) {
      case BodyLooksLike.Point:
        program = new PointProgram(gl, body)
        break
      case BodyLooksLike.Circle:
        program = new CircleProgram(gl, body)
        break
      case BodyLooksLike.Ball:
        program = new BallProgram(gl, body)
        break
      case BodyLooksLike.Body:
        program = new BodyProgram(gl, body)
        break
    }
  }
  body.blk = bodyShape
  program.setCam(cam)
  program.setEther(ether)
  ether.put(body)
  await program.setup()
  programs.push(program)
  return body
}

const run = () => {

  gl.enable(gl.BLEND)
  gl.blendFunc(
    gl.SRC_ALPHA,
    gl.ONE_MINUS_SRC_ALPHA
  )

  gl.enable(gl.DEPTH_TEST)           // Enable depth testing
  gl.depthFunc(gl.LEQUAL)

  frames.push(
    ...programs.map(prog => prog.boot())
  )

  const loop = () => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)  // Clear to black, fully opaque
    gl.clearDepth(1.0)                 // Clear everything
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
  ether = new Ether()
  const sun = await createProgram(new Body(Sun).withRings(), BodyLooksLike.Body)
  // await createProgram(new Body(Mercury))
  // await createProgram(new Body(Venus))
  // await createProgram(new Body(Earth))
  // await createProgram(new Body(Mars))
  // await createProgram(new Body(Jupiter))
  // await createProgram(new Body(Saturn))
  // await createProgram(new Body(Uranus))
  // await createProgram(new Body(Neptune))
  // await createProgram(new Body(Ceres))
  // await createProgram(new Body(Eris))
  // await createProgram(new Body(Pluto))

  await createProgram(new Body(Halley))
  await createProgram(new Body(Tempel1))
  await createProgram(new Body(Holmes))
  await createProgram(new Body(HaleBopp))

  cam.put([
    0, - Mercury.aphelion, 100000
  ])
    .lookAt(sun)
    .adjust(
      Math.PI * (120 / 180), // human naked eyes.
      100,
      Infinity
    )
  const distance = glMatrix.vec3.len(cam.coord)
  ether.writeLine(`You're ${(distance / AU).toFixed(6)} AU far from the origin.`)

  run()
}

const earthSys = async () => {
  setupGLContext()

  cam = new Camera(W / H)
  ether = new Ether()
  const earth = await createProgram(new Body(Earth).center(), BodyLooksLike.Body)
  await createProgram(new Body(Luna), BodyLooksLike.Body)

  cam.put([
    0, -384, 1
  ])
    .lookAt(earth)
    .adjust(
      Math.PI * (120 / 180), // human naked eyes.
      100,
      Infinity
    )
  const distance = glMatrix.vec3.len(cam.coord)
  ether.writeLine(`You're ${(distance / AU).toFixed(6)} AU far from the origin.`)

  run()
}

const jupiterSys = async () => {
  setupGLContext()

  cam = new Camera(W / H)
  ether = new Ether()
  const jupiter = await createProgram(new Body(Jupiter).center(), BodyLooksLike.Body)

  const lo = await createProgram(new Body(Lo), BodyLooksLike.Circle)
  const europa = await createProgram(new Body(Europa), BodyLooksLike.Circle)
  const ganymede = await createProgram(new Body(Ganymede), BodyLooksLike.Circle)
  const callisto = await createProgram(new Body(Callisto), BodyLooksLike.Circle)

  const cameraCoords: vec3 = [
    0, -1297, 900
  ]

  lo.face(cameraCoords)
  europa.face(cameraCoords)
  ganymede.face(cameraCoords)
  callisto.face(cameraCoords)

  cam.put(cameraCoords)
    .lookAt(jupiter)
    .adjust(
      Math.PI * (120 / 180), // human naked eyes.
      100,
      Infinity
    )
  const distance = glMatrix.vec3.len(cam.coord)
  ether.writeLine(`You're ${(distance / AU).toFixed(6)} AU far from the origin.`)

  run()
}

const saturnSys = async () => {
  setupGLContext()

  cam = new Camera(W / H)
  ether = new Ether()
  const jupiter = await createProgram(new Body(Saturn).center().withRings(), BodyLooksLike.Body)
  const titan = await createProgram(new Body(Titan), BodyLooksLike.Circle)
  const rhea = await createProgram(new Body(Rhea), BodyLooksLike.Circle)

  const cameraCoords: vec3 = [0, -1257, 600]
  titan.face(cameraCoords)
  rhea.face(cameraCoords)
  cam.put(cameraCoords)
    .lookAt(jupiter)
    .adjust(
      Math.PI * (120 / 180), // human naked eyes.
      100,
      Infinity
    )
  const distance = glMatrix.vec3.len(cam.coord)
  ether.writeLine(`You're ${(distance / AU).toFixed(6)} AU far from the origin.`)

  run()
}

const dev = async () => {
  setupGLContext()

  cam = new Camera(W / H)
  ether = new Ether()
  const body = await createProgram(new Body(Rhea).center(), BodyLooksLike.Circle)

  cam.put([
    0, -0, 80
  ])
    .lookAt(body)
    .adjust(
      Math.PI * (120 / 180), // human naked eyes.
      .01,
      Infinity
    )
  const distance = glMatrix.vec3.len(cam.coord)
  ether.writeLine(`You're ${(distance / AU).toFixed(6)} AU far from the origin.`)

  run()
}

solar()
// jupiterSys()
// saturnSys()
// earthSys()