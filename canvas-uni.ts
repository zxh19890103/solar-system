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
import { Luna } from "./canvas-uni-satellites"
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

const camera = new CameraSys()
camera.translates(0, Eris.aphelion, 0)
camera.setZAxis()
camera.setFocalLength(AU * .009)

const ether = new Ether(createCanvasCtx(), camera)

const dispayRadiusTimes = 100000

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
ether.put(createBodyByConfig({
  ...Eris,
  dispayRadiusTimes
}))
ether.put(createBodyByConfig({
  ...Pluto,
  dispayRadiusTimes
}))
// ether.put(createBodyByConfig({
//   ...Mercury,
//   dispayRadiusTimes,
// }))
// ether.put(createBodyByConfig({
//   ...Venus,
//   dispayRadiusTimes,
// }))
// ether.put(createBodyByConfig({
//   ...Earth,
//   sizeInPixels: 10,
// }))
// ether.put(createBodyByConfig({
//   ...Mars,
//   dispayRadiusTimes,
// }))
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
ether.put(createBodyByConfig({
  ...HaleBopp,
  dispayRadiusTimes
}))

ether.loop()