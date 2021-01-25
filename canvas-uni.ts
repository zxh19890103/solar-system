import { Ether } from "./canvas-uni-ether"
import { createBody } from "./canvas-uni-body"
import {
  Sun,
  Earth,
  BodyInfo,
  Venus,
  Mars,
  Jupiter,
  Mercury,
  Uranus,
  Pluto,
  Neptune,
  Saturn
} from "./canvas-uni-8"
import { Halley, Tempel1, Holmes, HaleBopp } from "./canvas-uni-comets"
import { CameraSys } from "./canvas-uni-camera"
import { AU } from "./canvas-uni-constants"
import { Luna } from "./canvas-uni-satellites"

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
camera.translates(0, 4 * AU, Pluto.aphelion)
camera.setZAxis()
camera.adjustCanvasCoords()
camera.setFocalLength(AU * .004)

const ether = new Ether(createCanvasCtx(), camera)

const dispayRadiusTimes = 50

ether.put(createBodyByConfig({
  ...Sun,
  sizeInPixels: 1,
  avatar: ""
}))
ether.put(createBodyByConfig({
  ...Mercury,
  dispayRadiusTimes,
}))
ether.put(createBodyByConfig({
  ...Venus,
  dispayRadiusTimes,
}))
ether.put(createBodyByConfig({
  ...Earth,
  dispayRadiusTimes,
}))
ether.put(createBodyByConfig({
  ...Mars,
  dispayRadiusTimes,
}))
ether.put(createBodyByConfig({
  ...Jupiter,
  dispayRadiusTimes,
}))
ether.put(createBodyByConfig({
  ...Saturn,
  dispayRadiusTimes,
}))
ether.put(createBodyByConfig({
  ...Uranus,
  dispayRadiusTimes,
}))
ether.put(createBodyByConfig({
  ...Neptune,
  dispayRadiusTimes,
}))
ether.put(createBodyByConfig({
  ...Halley,
  dispayRadiusTimes
}))
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
//   sizeInPixels: 30
// }))

ether.loop()