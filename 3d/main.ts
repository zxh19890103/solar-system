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
import {
  Ceres, Earth, Jupiter, Mars, Mercury, Neptune,
  Saturn, Sun, Uranus, Venus, Eris, Pluto, Halley,
  Tempel1, Holmes, HaleBopp, Luna,
  Lo, Europa, Ganymede, Callisto, Titan, Rhea,
  BodyInfo,
  Enceladus, Mimas, Tethys,
  Dione, Iapetus, Proteus, Triton, Nereid, Bodies13
} from "./body-info"
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
import { AU, RAD_PER_DEGREE } from "./constants"
import { TailProgram } from "./tail-program.class"

import "../env.js"
import { parseColor } from "./utils"

let W: number = 0
let H: number = 0
let gl: WebGLRenderingContext
let cam: Camera
let ether: Ether

let DEFAULT_RENDER_AS = RenderBodyAs.Point

const setupGLContext = () => {
  const canvasElement = document.createElement("canvas")
  W = window.innerWidth
  H = window.innerHeight
  canvasElement.width = W
  canvasElement.height = H
  document.body.appendChild(canvasElement)
  gl = canvasElement.getContext("webgl")
}

const createProgram = (rba) => {
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
      case RenderBodyAs.Tails:
        program = new TailProgram(gl, cam, ether)
        break
    }
  }
  return program
}

const createBody = (inf: BodyInfo | Body, rba: RenderBodyAs = DEFAULT_RENDER_AS) => {
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

  const distance = cam.far
  if (distance / AU > .099) {
    ether.writeLine(`You're ${(distance / AU).toFixed(6)} AU far from the target body.`)
  } else {
    ether.writeLine(`You're ${(distance * 1000).toFixed(2)} km far from the target body.`)
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
    ether.move()

    requestAnimationFrame(loop)
  }

  ether.connectsWithWorker(worker)

  loop()
}

const solar = async () => {
  setupGLContext()

  cam = new Camera(W / H)
  ether = new Ether(1000, 50)

  const sun = new Body(Sun)

  createBodies(
    sun,
    RenderBodyAs.Point,
    Mercury,
    RenderBodyAs.Orbit,
    Venus,
    RenderBodyAs.Orbit,
    Earth,
    RenderBodyAs.Orbit,
    Mars,
    RenderBodyAs.Orbit,
    Jupiter,
    RenderBodyAs.Point,
    RenderBodyAs.Orbit,
    Saturn,
    RenderBodyAs.Point,
    RenderBodyAs.Orbit,
    Uranus,
    RenderBodyAs.Orbit,
    Neptune,
    RenderBodyAs.Point,
    RenderBodyAs.Orbit,

    Ceres,
    RenderBodyAs.Orbit,
    Eris,
    RenderBodyAs.Orbit,
    Pluto,
    RenderBodyAs.Orbit,
  )

  cam.put([
    0, - Mars.aphelion, Mercury.aphelion
  ])
    .lookAt(sun)
    .adjust(
      Math.PI * (120 / 180), // human naked eyes.
      100,
      Infinity
    )
  run()
}

const comets = async () => {
  setupGLContext()

  cam = new Camera(W / H)
  ether = new Ether(7000, 30)

  const sun = new Body(Sun).center()
  const tempel1 = new Body(Tempel1)
  const homes = new Body(Holmes)
  const halley = new Body(Halley)
  const haleBopp = new Body(HaleBopp)

  createBodies(
    sun,
    RenderBodyAs.Point,

    tempel1,
    RenderBodyAs.Orbit,
    RenderBodyAs.Tails,

    homes,
    RenderBodyAs.Orbit,
    RenderBodyAs.Tails,

    halley,
    RenderBodyAs.Orbit,
    RenderBodyAs.Tails,

    haleBopp,
    RenderBodyAs.Orbit,
    RenderBodyAs.Tails
  )

  cam.put([
    .2, - 6 * AU, 3
  ]).lookAt(sun)
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
  ether = new Ether(10, 5)

  const earth = new Body(Earth).center()
  const luna = new Body(Luna)
  const satellite = new Body({
    ...Luna,
    name: "Satellite#1",
    mass: 1 * Math.pow(10, -21),
    aphelion: (Earth.radius + 2),
    semiMajorAxis: (Earth.radius + 2),
    color: parseColor("#ff8800"),
    inclination: 30 * RAD_PER_DEGREE
  })

  const satellite2 = new Body({
    ...Luna,
    name: "Satellite#3",
    mass: 1 * Math.pow(10, -21),
    aphelion: (Earth.radius + 36),
    semiMajorAxis: (Earth.radius + 36),
    color: parseColor("#ffff00"),
    inclination: 45 * RAD_PER_DEGREE
  })

  createBodies(
    earth,
    RenderBodyAs.Body,
    luna,
    RenderBodyAs.Body,
    RenderBodyAs.Orbit,
    satellite,
    RenderBodyAs.Point,
    RenderBodyAs.Orbit,
    satellite2,
    RenderBodyAs.Point,
    RenderBodyAs.Orbit
  )

  cam.put([
    0, -38, 1
  ])
    .lookAt(earth)
    .adjust(
      Math.PI * (45 / 180), // human naked eyes.
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
    RenderBodyAs.Body,
    Lo,
    RenderBodyAs.Orbit,
    Europa,
    RenderBodyAs.Orbit,
    Ganymede,
    RenderBodyAs.Orbit,
    Callisto,
    RenderBodyAs.Orbit,
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

const neptuneSys = async () => {
  setupGLContext()

  cam = new Camera(W / H)
  ether = new Ether(10, 10)
  const neptune = new Body(Neptune).center()
  createBodies(
    neptune,
    RenderBodyAs.Body,
    Proteus,
    RenderBodyAs.Orbit,
    Triton,
    RenderBodyAs.Orbit,
    Nereid,
    RenderBodyAs.Orbit,
  )

  cam.put([0, -Proteus.semiMajorAxis, 10])
    .lookAt(neptune)
    .adjust(
      Math.PI * (120 / 180), // human naked eyes.
      10,
      Infinity
    )

  run()
}

const single = async (name: string) => {
  setupGLContext()

  let inf: BodyInfo = Bodies13[name]

  if (inf === undefined || inf === null)
    inf = Earth

  cam = new Camera(W / H)
  ether = new Ether()
  const pluto = new Body(inf).center()
  if (inf.rings) {
    createBodies(
      pluto,
      RenderBodyAs.Body,
      RenderBodyAs.Rings
    )
  } else {
    createBodies(
      pluto,
      RenderBodyAs.Body
    )
  }

  cam.put([0, -inf.radius * 3, inf.radius * .68])
    .lookAt(pluto)
    .adjust(
      Math.PI * (45 / 180), // human naked eyes.
      .1,
      Infinity
    )

  run()
}

const compare = (...infs: BodyInfo[]) => {
  setupGLContext()
  cam = new Camera(W / H)
  ether = new Ether(10, 10, true)

  DEFAULT_RENDER_AS = RenderBodyAs.Body

  infs.sort((inf0, inf1) => inf1.radius - inf0.radius)

  const bodies = infs.map(inf => new Body(inf))
  const Rt = infs.reduce((r, inf) => inf.radius + r, 0)

  const X_FOV = 30
  const FAR = Rt / Math.tan(X_FOV * RAD_PER_DEGREE)

  const xRad = (r0: number) => {
    const angle = Math.asin(r0 / r)
    return Math.max(RAD_PER_DEGREE, angle)
  }

  let r = FAR, z = -.1, a = 0, i = 0
  for (const body of bodies) {
    body.coordinates = [r * Math.sin(a), r * Math.cos(a) + FAR, z]
    a += xRad(infs[i].radius)
    i += 1
    if (bodies[i] === undefined) break
    a += xRad(infs[i].radius)
    a += 2 * RAD_PER_DEGREE
  }

  createBodies(
    ...bodies
  )

  cam.put([0, - FAR, .1])
    .up([0, 0, 1])
    .lookAt([0, 0, 0])
    .adjust(
      Math.PI * (45 / 180), // human naked eyes.
      .1,
      Infinity
    )
  run()
}

const planets01 = () => {
  const SELECTED_BODIES_KEY = "SELECTED_BODIES"
  const selectedBodies: Set<string> = new Set()
  const SELECTED_BODIES = localStorage.getItem(SELECTED_BODIES_KEY)
  if (SELECTED_BODIES) {
    const arr = JSON.parse(SELECTED_BODIES)
    arr.forEach(n => selectedBodies.add(n))
  } else {
    selectedBodies.add("Earth")
    selectedBodies.add("Luna")
  }

  const checkboxGroup = document.createElement("div")

  checkboxGroup.style.cssText = `
    position: fixed;
    z-index: 1;
    bottom: 10px;
    left: 0;
    height: 50px;
    line-height: 50px;
  `

  checkboxGroup.addEventListener("click", (evt: any) => {
    const target = evt.target
    if (target.tagName === "A") {
      const bodyname = target.dataset["bodyname"]
      if (selectedBodies.has(bodyname)) {
        selectedBodies.delete(bodyname)
        target.style.color = "white"
      } else {
        selectedBodies.add(bodyname)
        target.style.color = "green"
      }
    }
  })

  for (const [name, inf] of Object.entries(Bodies13)) {
    const a = document.createElement("a")
    a.textContent = name
    a.style.color = selectedBodies.has(name) ? `green` : "white"
    a.style.marginRight = "5px"
    a.style.textDecoration = "none"
    a.style.borderBottom = `1px dashed rgba(${inf.color.map(c => 0 ^ c * 255)})`
    a.href = "javascript:void(0);"
    a.dataset["bodyname"] = name

    checkboxGroup.appendChild(a)
  }

  const button = document.createElement("a")
  button.href = "javascript:void(0);"
  button.style.cssText = `
  display: block;
  float: right;
  color: white;
  width: 50px;
  height: 50px;
  line-height: 50px;
  text-align: center;
  background-image: url(/nineplanets-org/neptune-150x150.png);
  background-size: 100% 100%;
  -webkit-background-size: 100% 100%;
  background-repeat: no-repeat;
  `
  button.textContent = "OK"
  button.addEventListener("click", () => {
    localStorage.setItem(SELECTED_BODIES_KEY, JSON.stringify([...selectedBodies]))
    location.reload()
  })
  checkboxGroup.appendChild(button)

  document.body.appendChild(checkboxGroup)

  const bodies = []
  for (const [name, value] of selectedBodies.entries()) {
    bodies.push(Bodies13[name])
  }
  compare(...bodies)
}

const main = () => {
  const match = location.search.match(/\?sys=([a-zA-Z]+)/)
  if (match === null) {
    single("Earth")
  } else {
    const [, sys] = match
    switch (sys) {
      case "compare":
        planets01()
        break
      case "solar":
        solar()
        break
      case "jupiter":
        jupiterSys()
        break
      case "saturn":
        saturnSys()
        break
      case "earth":
        earthSys()
        break
      case "neptune":
        neptuneSys()
        break
      case "comets":
        comets()
        break
      default:
        single(sys)
        break
    }
  }
}

const worker = new Worker(WORKER_SCRIPT_URL)

main()