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
import { Ceres, Earth, Jupiter, Mars, Mercury, Neptune, Saturn, Sun, Uranus, Venus, Eris, Pluto, Halley, Tempel1, Holmes, HaleBopp, Luna } from "./body-info"
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
  const sun = await createProgram(new Body(Sun), BodyLooksLike.Body)
  await createProgram(new Body(Mercury), BodyLooksLike.Ball)
  await createProgram(new Body(Venus), BodyLooksLike.Ball)
  await createProgram(new Body(Earth), BodyLooksLike.Body)
  // const luna = await createProgram(new Body(Luna), BodyLooksLike.Ball)
  await createProgram(new Body(Mars), BodyLooksLike.Body)
  await createProgram(new Body(Jupiter), BodyLooksLike.Body)
  await createProgram(new Body(Saturn), BodyLooksLike.Body)
  await createProgram(new Body(Uranus), BodyLooksLike.Body)
  const neptune = await createProgram(new Body(Neptune), BodyLooksLike.Body)
  await createProgram(new Body(Ceres), BodyLooksLike.Body)
  await createProgram(new Body(Eris), BodyLooksLike.Body)
  await createProgram(new Body(Pluto), BodyLooksLike.Body)

  // await createProgram(new Body(Halley))
  // await createProgram(new Body(Tempel1))
  // await createProgram(new Body(Holmes))
  // await createProgram(new Body(HaleBopp))

  cam.put([
    0, -Earth.aphelion, 1
  ])
    .lookAt(sun)
    .adjust(
      Math.PI * (120 / 180), // human naked eyes.
      .1,
      Infinity
    )
  const distance = glMatrix.vec3.len(cam.coord)
  ether.writeLine(`You're ${(distance / AU).toFixed(6)} AU far from the origin.`)

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