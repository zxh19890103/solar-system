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
import { Ceres, Earth, Jupiter, Mars, Mercury, Neptune, Saturn, Sun, Uranus, Venus, Eris, Pluto, Halley, Tempel1, Holmes, HaleBopp, Luna, Lo, Europa, Ganymede, Callisto, Titan, Rhea, BodyInfo, Enceladus, Mimas, Tethys, Dione, Iapetus } from "./body-info"
import { BodyProgram } from "./body-program.class"
import { Body, RenderBodyAs } from "./body.class"
import { Camera } from "./camera.class"
import { CircleProgram } from "./circle-program.class"
import { Ether } from "./ether"
import { PointProgram } from "./point-program.class"
import { ObjectProgram } from "./program.class"
import { BallProgram } from "./ball-program.class"
import { OrbitProgram } from "./orbit-program.class"
import { RingsProgram } from "./rings-program.class"
import { AU } from "./constants"

let W: number = 0
let H: number = 0
let gl: WebGLRenderingContext
let cam: Camera
let ether: Ether

const setupGLContext = () => {
  const canvasElement = document.createElement("canvas")
  W = window.innerWidth
  H = window.innerHeight
  canvasElement.width = W
  canvasElement.height = H
  document.body.appendChild(canvasElement)
  gl = canvasElement.getContext("webgl")
}

const createProgram = (rba = RenderBodyAs.Point) => {
  let program: ObjectProgram = null
  {
    switch (rba) {
      case RenderBodyAs.Point:
        program = new PointProgram(gl, cam, ether)
        break
      case RenderBodyAs.Circle:
        program = new CircleProgram(gl, cam, ether)
        break
      case RenderBodyAs.Ball:
        program = new BallProgram(gl, cam, ether)
        break
      case RenderBodyAs.Body:
        program = new BodyProgram(gl, cam, ether)
        break
      case RenderBodyAs.Orbit:
        program = new OrbitProgram(gl, cam, ether)
        break
      case RenderBodyAs.Rings:
        program = new RingsProgram(gl, cam, ether)
        break
    }
  }
  return program
}

const createBody = (inf: BodyInfo | Body, rba: RenderBodyAs = RenderBodyAs.Point) => {
  const body = inf instanceof Body ? inf : new Body(inf)
  ether.put(body)
  const prog = createProgram(rba)
  body.useProgram(prog)
  return body
}

const createBodies = (...items: (BodyInfo | Body | RenderBodyAs)[]) => {
  let body: Body = null
  let created = false
  for (const item of items) {
    if (typeof item === "number") {
      if (body !== null) {
        createBody(body, item)
        created = true
      }
    } else {
      if (body !== null && !created)
        createBody(body)
      body = item instanceof Body ? item : new Body(item)
      created = false
    }
  }
  if (body !== null && !created)
    createBody(body)
}

const run = async () => {

  const distance = glMatrix.vec3.len(cam.coord)
  if (distance / AU > .099) {
    ether.writeLine(`You're ${(distance / AU).toFixed(6)} AU far from the center body.`)
  } else {
    ether.writeLine(`You're ${(distance * 1000).toFixed(2)} km far from the center body.`)
  }

  gl.enable(gl.BLEND)
  gl.blendFunc(
    gl.SRC_ALPHA,
    gl.ONE_MINUS_SRC_ALPHA
  )

  gl.enable(gl.DEPTH_TEST)           // Enable depth testing
  gl.depthFunc(gl.LEQUAL)

  const frames = await ether.boot()

  const loop = () => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)  // Clear to black, fully opaque
    gl.clearDepth(1.0)                 // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    frames.forEach(f => f())

    requestAnimationFrame(loop)
  }

  loop()
}

const solar = async () => {
  setupGLContext()

  cam = new Camera(W / H)
  ether = new Ether(3000, 100)

  const sun = new Body(Sun)

  createBodies(
    sun,
    RenderBodyAs.Point,
    // Mercury,
    // RenderBodyAs.Orbit,
    // Venus,
    // RenderBodyAs.Orbit,
    // Earth,
    // RenderBodyAs.Orbit,
    // Mars,
    // RenderBodyAs.Orbit,
    // Jupiter,
    // RenderBodyAs.Orbit,
    // Saturn,
    // Uranus,
    // Neptune,

    // Ceres,
    // Eris,
    // Pluto,

    Halley,
    RenderBodyAs.Orbit,
    Tempel1,
    RenderBodyAs.Orbit,
    Holmes,
    RenderBodyAs.Orbit,
    HaleBopp,
    RenderBodyAs.Orbit,
  )

  cam.put([
    0, - Holmes.aphelion, Earth.aphelion
  ])
    .lookAt(sun)
    .adjust(
      Math.PI * (120 / 180), // human naked eyes.
      100,
      Infinity
    )
  run()
}

const earthSys = async () => {
  setupGLContext()

  cam = new Camera(W / H)
  ether = new Ether()

  const earth = new Body(Earth).center()
  createBodies(
    earth,
    RenderBodyAs.Body,
    // Luna
  )

  cam.put([
    0, -8, 1
  ])
    .lookAt(earth)
    .adjust(
      Math.PI * (120 / 180), // human naked eyes.
      .1,
      Infinity
    )

  run()
}

const jupiterSys = async () => {
  setupGLContext()

  cam = new Camera(W / H)
  ether = new Ether()
  const jupiter = new Body(Jupiter).center()
  createBodies(
    jupiter,
    RenderBodyAs.Ball,
    Lo,
    Europa,
    RenderBodyAs.Orbit,
    Ganymede,
    RenderBodyAs.Orbit,
    Callisto,
    RenderBodyAs.Ball,
  )

  const cameraCoords: vec3 = [
    0, -1297, 900
  ]

  // lo.face(cameraCoords)
  // europa.face(cameraCoords)
  // ganymede.face(cameraCoords)
  // callisto.face(cameraCoords)

  cam.put(cameraCoords)
    .lookAt(jupiter)
    .adjust(
      Math.PI * (120 / 180), // human naked eyes.
      100,
      Infinity
    )
  run()
}

const saturnSys = async () => {
  setupGLContext()

  cam = new Camera(W / H)
  ether = new Ether()
  const saturn = new Body(Saturn).center()
  const tian = new Body(Titan)
  const rhea = new Body(Rhea)
  const enceladus = new Body(Enceladus)
  createBodies(
    saturn,
    RenderBodyAs.Body,
    RenderBodyAs.Rings,
    Mimas,
    RenderBodyAs.Orbit,
    Tethys,
    RenderBodyAs.Orbit,
    Dione,
    RenderBodyAs.Orbit,
    tian,
    RenderBodyAs.Orbit,
    rhea,
    RenderBodyAs.Orbit,
    enceladus,
    RenderBodyAs.Orbit,
    Iapetus,
    RenderBodyAs.Orbit,
  )

  cam.put([0, -Rhea.aphelion, 300])
    .lookAt(saturn)
    .adjust(
      Math.PI * (120 / 180), // human naked eyes.
      100,
      Infinity
    )

  run()
}

const pluto = async () => {
  setupGLContext()

  cam = new Camera(W / H)
  ether = new Ether()
  const pluto = new Body(Pluto).center()
  createBodies(
    pluto,
    RenderBodyAs.Body,
  )

  cam.put([0, -2, .4])
    .lookAt(pluto)
    .adjust(
      Math.PI * (120 / 180), // human naked eyes.
      .1,
      Infinity
    )

  run()
}

// solar()
// jupiterSys()
// saturnSys()
// earthSys()
pluto()