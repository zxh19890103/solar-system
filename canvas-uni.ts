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
camera.translates(1.2 * Jupiter.aphelion, 0, 1.1 * Jupiter.aphelion)
// camera.setZAxis()
// camera.rotatesZ(Math.PI * .5)
// camera.rotatesX(Math.PI)
camera.setZAxis()
camera.rotatesZ(Math.PI * 1.5)
// camera.rotatesX(Math.PI)
// camera.rotatesY(1.8258176636680326)
// camera
// camera.rotatesY(Math.PI)
camera.setFocalLength(AU * .002)

const ether = new Ether(createCanvasCtx(), camera)

ether.put(createBodyByConfig({
  ...Sun,
  sizeInPixels: 1,
  avatar: ""
}))
ether.put(createBodyByConfig({
  ...Mercury,
  dispayRadiusTimes: 50,
}))
ether.put(createBodyByConfig({
  ...Venus,
  dispayRadiusTimes: 50,
}))
// ether.put(createBodyByConfig({
//   ...Mars,
//   sizeInPixels: Mars.radius * 200
// }))
ether.put(createBodyByConfig({
  ...Earth,
  dispayRadiusTimes: 50
}))
ether.put(createBodyByConfig({
  ...Jupiter,
  dispayRadiusTimes: 50
}))
// ether.put(createBodyByConfig({
//   ...Saturn
// }))
// ether.put(createBodyByConfig({
//   ...Uranus
// }))
// ether.put(createBodyByConfig({
//   ...Neptune
// }))
// ether.put(createBodyByConfig({
//   ...Halley,
//   sizeInPixels: 1
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
//   sizeInPixels: 30
// }))

ether.loop()