import { CelestialBody, CreateBodyReturns } from "./canvas-uni-body"
import { CameraSys } from "./canvas-uni-camera"
import { DAYS_PER_SECOND, ZINDE_RESOLUTION } from "./canvas-uni-constants"

export class Ether {
  private _count = 0
  bodies: CreateBodyReturns[] = []
  ctx: CanvasRenderingContext2D = null
  canvas: HTMLCanvasElement = null
  camera: CameraSys = null
  w: number = 0
  h: number = 0
  private textLineNo: number = 0
  private textLineHeight = 16
  private textLeftBo = 0
  private textBottomBo = 0
  /**
   * around the sun,
   * unit: x10^3 km.
   */
  private meanRadius = 0
  private currentBodyPut: CelestialBody = null

  get count() {
    return this._count
  }

  constructor(ctx: CanvasRenderingContext2D, camera: CameraSys) {
    this.ctx = ctx
    this.canvas = ctx.canvas
    this.camera = camera

    this.w = this.canvas.width
    this.h = this.canvas.height
    ctx.font = "12px  'OCR A'"
    ctx.strokeStyle = "white"
    ctx.fillStyle = "white"
    ctx.lineWidth = 1
    ctx.textBaseline = "top"

    this.textLeftBo = - this.w / 2 + 10
    this.textBottomBo = this.h / 2 - this.textLineHeight

    this.meanRadius = 2 * this.camera.computesDistanceFromOrigin()
  }

  writeLine(txt: string) {
    this.ctx.beginPath()
    this.ctx.fillText(txt, this.textLeftBo, this.computesTextYPos())
    this.textLineNo += 1
  }

  text(txt: string, lineno: number) {
    this.ctx.beginPath()
    this.ctx.clearRect(this.textLeftBo, this.computesTextYPos(lineno), this.w, this.textLineHeight)
    this.ctx.fillText(txt, this.textLeftBo, this.computesTextYPos(lineno))
  }

  private computesTextYPos(lineno?: number) {
    return this.textBottomBo - this.textLineHeight * (lineno || this.textLineNo)
  }

  put(cbr: CreateBodyReturns) {
    const { body: body0 } = cbr
    this.bodies.forEach(({ body }) => {
      body.watch(body0)
      body0.watch(body)
    })
    this.bodies.push(cbr)
    body0.ether = this
    body0.inf.index = this._count++
    this.currentBodyPut = body0
    return this
  }

  withSatellites(...statellites: CreateBodyReturns[]) {
    const cbp = this.currentBodyPut
    if (cbp === null || statellites.length === 0) return
    statellites.forEach(statellite => {
      statellite.body.inf.ref = cbp.inf
      cbp.addSatellite(statellite.body)
      this.put(statellite)
    })
    this.currentBodyPut = null
  }

  private layers = {}
  /**
 * z-index increments while z getting smaller.
 * @param z 10^3 km
 */
  setLayersOrder = (name: string, cavs: HTMLCanvasElement, z: number, index: number) => {
    const a = Math.ceil((this.meanRadius - z) / ZINDE_RESOLUTION)
    const layers = this.layers
    if (layers[name] === a) return
    layers[name] = a
    cavs.style.zIndex = a + ''
    this.text(`${name}'z = ${a}`, index + 9)
  }

  loop() {
    const resol = (this.camera.computesResolutionOnZ() * 1000).toFixed(2)
    const dps = DAYS_PER_SECOND.toFixed(2)
    this.writeLine(`1pixel ≈ ${resol} km at the origin; 1s ≈ ${dps} days.`)
    Promise.all(
      this.bodies.map(b => b.prepare())
    ).then(() => {
      this.bodies.forEach(b => b.run())
    })
  }
}
