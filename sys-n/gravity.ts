import { BodyInfo } from "../sys/body-info"
import { AU } from "../sys/constants"

const G = 6.67 * .001

/**
 * one year on earth equals this value.
 * 365 * 24 * 60 * 60
 */
const K = 3156769.959

const BEST_INITIAL_VELOCITY = {
  Mecury: .3870,
  Venus: .3460,
  Earth: .2890,
  Mars: .2178,
  Jupiter: .1230,
  Saturn: .0902,
  Uranus: .065,
  Neptune: .0533,
}

const div = document.createElement('div')
div.style.cssText = `
position: absolute;
top: 8px;
left: 8px;
color: #fff;
font-size: 14px;
z-index: 10;
width: 200px;
`
document.body.appendChild(div)

const insertCanvas = (info: BodyInfo) => {
  const dpr = window.devicePixelRatio
  const canvas = document.createElement('canvas')
  canvas.width = 200 * dpr
  canvas.height = 60 * dpr
  canvas.style.cssText = `width: 200px; height: 60px; position: static;`
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  div.appendChild(canvas)
  const color = 'rgba(' + info.color.map(x => 0 ^ x * 255).join(',') + ')'
  ctx.strokeStyle = color
  ctx.textBaseline = 'top'
  const h = 12
  ctx.font = `${h}px / 1 Wawati SC`
  ctx.strokeText(info.name, 0, 0, 200)

  return {
    write: (txt: string, lineno = 1) => {
      ctx.clearRect(0, h * lineno, 200, h)
      ctx.strokeText(txt, 0, h * lineno, 200)
    }
  }
}


export class CelestialBody {
  o3: THREE.Object3D
  info: BodyInfo
  velocity: THREE.Vector3
  position: THREE.Vector3
  orbitalAxis: THREE.Vector3
  period: number = 0

  inclinationMat: THREE.Matrix4

  ref: CelestialBody = null

  writer: { write: (txt: string, lineno?: number) => void }

  constructor(o3: THREE.Object3D, info: BodyInfo) {
    this.o3 = o3
    this.info = info

    this.position = new THREE.Vector3(0, 0, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)
  }

  init() {

    const refPlane = new THREE.Vector3(.3, 0, 1)
    this.orbitalAxis = new THREE.Vector3(0, 1, 0)
    const mat = new THREE.Matrix4()
    mat.makeRotationAxis(refPlane, this.info.inclination)
    this.orbitalAxis.applyMatrix4(mat)

    this.inclinationMat = mat

    this.putObjectOnAphelion()
    this.period = this.computePeriod()

    this.writer = insertCanvas(this.info)
  }

  private computeAccByRef(position0: [number, number, number], position: THREE.Vector3, mass: number) {
    const [x, y, z] = position0
    const { x: rx, y: ry, z: rz } = position
    const r2 = (
      (x - rx) * (x - rx) +
      (y - ry) * (y - ry) +
      (z - rz) * (z - rz)
    )

    const scalar = G * mass / r2

    const dx = rx - x,
      dy = ry - y,
      dz = rz - z

    const dir = [dx, dy, dz]

    const length = Math.sqrt(dx * dx + dy * dy + dz * dz)

    return dir.map(com => scalar * com / length)
  }

  private buffer() {
    let n = 100
    const dt = 100
    const v = this.velocity.clone().toArray()
    const p = this.position.clone().toArray()

    const arg0 = this.ref.position
    const M = this.ref.info.mass

    const getAcc = this.computeAccByRef

    while (n--) {
      const a = getAcc(
        p,
        arg0,
        M
      ) // force changes
      const dv = a.map(c => c * dt)
      const [vx, vy, vz] = v
      const [dvx, dvy, dvz] = dv
      const ds = [
        vx * dt + .5 * dvx * dt,
        vy * dt + .5 * dvy * dt,
        vz * dt + .5 * dvz * dt,
      ]

      v[0] += dv[0]
      v[1] += dv[1]
      v[2] += dv[2]

      p[0] += ds[0]
      p[1] += ds[1]
      p[2] += ds[2]
    }

    this.velocity.set(...v) // velocity changes
    this.position.set(...p)// position changes
  }

  public next() {
    this.buffer()
    // sync mesh
    this.o3.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    )

    const writer = this.writer
    const distance = this.position.length() / AU
    writer.write(`distance: ${distance.toFixed(6)} AU`, 1)
    const speed = this.velocity.length() * 100
    writer.write(`speed: ${speed.toFixed(2)} km/s`, 2)
    writer.write(`period: ${this.period.toFixed(2)} year(s) / ${(this.s / 1000).toFixed(2)}s`, 3)

    this.computeActualPeriod(speed)
  }

  /**
   * Best Velocity:
   * 
   * Mecury: .3870
   * Venus: .3460
   * Earth: .2890
   * Mars: .2178
   * Jupiter: .1230
   * Saturn: .0902
   * Uranus: .065
   * Neptune: .0533
   */

  private putObjectOnAphelion() {
    const { ref, semiMajorAxis, aphelion } = this.info
    this.position = new THREE.Vector3(aphelion, 0, 0)
    this.position.applyMatrix4(this.inclinationMat)
    const m = ref.mass
    const scalar = BEST_INITIAL_VELOCITY[this.info.name] || Math.sqrt(G * m * (2 / aphelion - 1 / semiMajorAxis))
    console.log(scalar)
    this.velocity = new THREE.Vector3(0, 0, scalar)
    this.velocity.applyMatrix4(this.inclinationMat)
  }

  private stage: 1 | 2 | 3 | 4 = 1
  private lastSpeed = 0
  private s: number = 0

  private computeActualPeriod(speed: number) {
    switch (this.stage) {
      case 1: {
        // a
        this.s = performance.now()
        this.stage = 2
        break
      }
      case 2: {
        // a -> p
        if (speed < this.lastSpeed) {
          this.stage = 3
        }
        break
      }
      case 3: {
        // p -> a
        if (speed > this.lastSpeed) {
          this.s = performance.now() - this.s
          this.stage = 4
        }
        break
      }
      case 4:
      default: {
      }
    }

    if (this.stage < 4) {
      this.lastSpeed = speed
    }
  }

  private computePeriod() {
    // t2 = (4PI2 * a * 3) / GM
    const pipi = Math.PI ** 2
    const aaa = this.info.semiMajorAxis ** 3
    const M = this.ref.info.mass
    return Math.sqrt(
      (4 * pipi * aaa) / (G * M)
    ) / K
  }
}