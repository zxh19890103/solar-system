import { Ether } from "./canvas-uni-ether"
import { createBody } from "./canvas-uni-body"
import {
  Sun,
  BodyInfo,
  Earth,
  Venus,
  Mars,
  Jupiter,
  Mercury,
  Uranus,
  Pluto,
  Neptune,
  Saturn,
  Ceres,
  Eris
} from "./canvas-uni-8"
import { Halley, Tempel1, Holmes, HaleBopp } from "./canvas-uni-comets"
import { CameraSys } from "./canvas-uni-camera"
import { AU } from "./canvas-uni-constants"
import { Callisto, Europa, Ganymede, Lo, Luna, Rhea, Titan } from "./canvas-uni-satellites"
import { Apophis } from "./canvas-uni-asteroids"

const dpr = window.devicePixelRatio
const W = window.innerWidth
const H = window.innerHeight
const stageW = W * dpr
const stageH = H * dpr

const createCanvasCtx = () => {
  const canvasElement = document.createElement("canvas")
  const ctx = canvasElement.getContext("2d")
  canvasElement.width = stageW
  canvasElement.height = stageH
  ctx.translate(stageW / 2, stageH / 2)
  document.body.appendChild(canvasElement)
  return ctx
}

const createBodyByConfig = (inf: BodyInfo) => {
  return createBody(inf, createCanvasCtx())
}

const solarSystem = () => {
  const camera = new CameraSys()
  camera.translates(0, Mars.aphelion, 0)
  camera.setZAxis()
  camera.setFocalLength(AU * .008)

  const ether = new Ether(createCanvasCtx(), camera)

  const dispayRadiusTimes = 1

  ether.put(createBodyByConfig({
    ...Sun,
    sizeInPixels: 1,
    avatar: ""
  }))
  // ether.put(createBodyByConfig({
  //   ...Ceres,
  //   sizeInPixels: 10
  // }))
  // ether.put(createBodyByConfig({
  //   ...Apophis,
  //   sizeInPixels: 10
  // }))
  // ether.put(createBodyByConfig({
  //   ...Eris,
  //   dispayRadiusTimes
  // }))
  // ether.put(createBodyByConfig({
  //   ...Pluto,
  //   dispayRadiusTimes
  // }))
  // ether.put(createBodyByConfig({
  //   ...Mercury,
  //   dispayRadiusTimes,
  // }))
  ether.put(createBodyByConfig({
    ...Venus,
    dispayRadiusTimes,
  }))
  ether.put(createBodyByConfig({
    ...Earth,
    color: "green",
    dispayRadiusTimes
  }))
  ether.put(createBodyByConfig({
    ...Mars,
    dispayRadiusTimes,
  }))
  // ether.put(createBodyByConfig({
  //   ...Jupiter,
  //   dispayRadiusTimes,
  // }))
  // ether.put(createBodyByConfig({
  //   ...Saturn,
  //   dispayRadiusTimes,
  // }))
  // ether.put(createBodyByConfig({
  //   ...Uranus,
  //   dispayRadiusTimes,
  // }))
  // ether.put(createBodyByConfig({
  //   ...Neptune,
  //   dispayRadiusTimes,
  // }))
  // ether.put(createBodyByConfig({
  //   ...Halley,
  //   dispayRadiusTimes
  // }))
  // ether.put(createBodyByConfig({
  //   ...Tempel1,
  //   sizeInPixels: .2
  // }))
  // ether.put(createBodyByConfig({
  //   ...Holmes,
  //   sizeInPixels: .2
  // }))
  // ether.put(createBodyByConfig({
  //   ...HaleBopp,
  //   dispayRadiusTimes
  // }))
  ether.loop()
}

const earthSystem = () => {
  const camera = new CameraSys()
  camera.translates(0, 0, Luna.aphelion + 50)
  camera.setZAxis()
  camera.setFocalLength(300)

  const ether = new Ether(createCanvasCtx(), camera)
  const dispayRadiusTimes = 1

  ether.put(createBodyByConfig({
    ...Earth,
    aphelion: 0,
    peribelion: 0,
    semiMajorAxis: 0,
    stick: true,
    inclination: 0,
    dispayRadiusTimes
  }))

  ether.put(createBodyByConfig({
    ...Luna,
    ref: Earth,
    dispayRadiusTimes
  }))

  ether.loop()
}

const jupiterSystem = () => {
  const camera = new CameraSys()
  camera.translates(0, Callisto.aphelion, .3 * Callisto.aphelion)
  camera.setZAxis()
  camera.setFocalLength(Callisto.aphelion * .3)

  const ether = new Ether(createCanvasCtx(), camera)
  const dispayRadiusTimes = 6

  ether.put(createBodyByConfig({
    ...Jupiter,
    aphelion: 0,
    peribelion: 0,
    semiMajorAxis: 0,
    stick: true,
    inclination: 0,
    sizeInPixels: 20
  }))

  ether.put(createBodyByConfig({
    ...Lo,
    ref: Jupiter,
    dispayRadiusTimes
  }))

  ether.put(createBodyByConfig({
    ...Europa,
    ref: Jupiter,
    dispayRadiusTimes
  }))

  ether.put(createBodyByConfig({
    ...Ganymede,
    ref: Jupiter,
    dispayRadiusTimes
  }))

  ether.put(createBodyByConfig({
    ...Callisto,
    ref: Jupiter,
    dispayRadiusTimes
  }))

  ether.loop()
}

const saturnSystem = () => {
  const camera = new CameraSys()
  camera.translates(0, Titan.aphelion, .3 * Titan.aphelion)
  camera.setZAxis()
  camera.setFocalLength(Titan.aphelion * .3)

  const ether = new Ether(createCanvasCtx(), camera)
  const dispayRadiusTimes = 6

  ether.put(createBodyByConfig({
    ...Saturn,
    aphelion: 0,
    peribelion: 0,
    semiMajorAxis: 0,
    stick: true,
    inclination: 0,
    sizeInPixels: 20
  }))

  ether.put(createBodyByConfig({
    ...Titan,
    ref: Saturn,
    dispayRadiusTimes
  }))

  ether.put(createBodyByConfig({
    ...Rhea,
    ref: Saturn,
    dispayRadiusTimes
  }))

  ether.loop()
}

earthSystem()
// jupiterSystem()
// saturnSystem()
