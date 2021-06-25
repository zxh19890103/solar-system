import { BodyInfo } from "../sys/body-info"
import { AU } from "../sys/constants"

type ARRAY_VECTOR3 = THREE.Vector3Tuple

const G = 6.67 * 0.001
const BUFFER_SIZE = 1000
const MOMENT = 100

/**
 * one year on earth equals this value.
 * 365 * 24 * 60 * 60
 */
const K = 3156769.959

const BEST_INITIAL_VELOCITY = {
  Mecury: 0.387,
  Venus: 0.346,
  Earth: 0.289,
  Mars: 0.2178,
  Jupiter: 0.123,
  Saturn: 0.0902,
  Uranus: 0.065,
  Neptune: 0.0533,
}

const div = document.createElement("div")
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
  const canvas = document.createElement("canvas")
  canvas.width = 200 * dpr
  canvas.height = 60 * dpr
  canvas.style.cssText = `width: 200px; height: 60px; position: static;`
  const ctx = canvas.getContext("2d")
  ctx.scale(dpr, dpr)
  div.appendChild(canvas)
  const color = "rgba(" + info.color.map((x) => 0 ^ (x * 255)).join(",") + ")"
  ctx.strokeStyle = color
  ctx.textBaseline = "top"
  const h = 13
  ctx.font = `${h}px / 1 Wawati SC`
  ctx.strokeText(info.name, 0, 0, 200)

  return {
    write: (txt: string, lineno = 1) => {
      ctx.clearRect(0, h * lineno, 200, h)
      ctx.strokeText(txt, 0, h * lineno, 200)
    },
  }
}

export class CelestialBody {
  o3: THREE.Object3D
  info: BodyInfo
  velocity: THREE.Vector3
  orbitalAxis: THREE.Vector3
  period: number = 0
  periodText: string = ''

  inclinationMat: THREE.Matrix4

  ref: CelestialBody = null

  writer: { write: (txt: string, lineno?: number) => void }

  constructor(o3: THREE.Object3D, info: BodyInfo) {
    this.o3 = o3
    this.info = info
    this.velocity = new THREE.Vector3(0, 0, 0)
  }

  init() {
    const refPlane = new THREE.Vector3(0.3, 0, 1)
    this.orbitalAxis = new THREE.Vector3(0, 1, 0)
    const mat = new THREE.Matrix4()
    mat.makeRotationAxis(refPlane, this.info.inclination)
    this.orbitalAxis.applyMatrix4(mat)

    this.inclinationMat = mat

    this.putObjectOnAphelion()
    this.period = this.computePeriod()
    this.periodText = this.period < .5 ? `${(this.period * 365).toFixed(2)} days` : `${this.period.toFixed(2)} years`

    this.writer = insertCanvas(this.info)
  }

  private computeAccBy(
    position0: ARRAY_VECTOR3,
    position: ARRAY_VECTOR3,
    mass: number
  ) {
    const [x, y, z] = position0
    const [rx, ry, rz] = position
    const r2 = (x - rx) * (x - rx) + (y - ry) * (y - ry) + (z - rz) * (z - rz)

    const scalar = (G * mass) / r2

    const dx = rx - x,
      dy = ry - y,
      dz = rz - z

    const dir = [dx, dy, dz]

    const length = Math.sqrt(dx * dx + dy * dy + dz * dz)

    return dir.map((com) => (scalar * com) / length)
  }

  private buffer(position: THREE.Vector3Tuple, velocity: THREE.Vector3Tuple) {

    let n = BUFFER_SIZE

    const computeAcc = this.computeAccBy
    const ref = this.ref
    const mass = ref.info.mass
    const origin: THREE.Vector3Tuple = [0, 0, 0]

    while (n--) {
      const a = computeAcc(position, origin, mass)
      const dv = [
        a[0] * MOMENT,
        a[1] * MOMENT,
        a[2] * MOMENT
      ]
      const [vx, vy, vz] = velocity
      const [dvx, dvy, dvz] = dv
      const ds = [
        vx * MOMENT + 0.5 * dvx * MOMENT,
        vy * MOMENT + 0.5 * dvy * MOMENT,
        vz * MOMENT + 0.5 * dvz * MOMENT,
      ]

      velocity[0] += dv[0]
      velocity[1] += dv[1]
      velocity[2] += dv[2]

      position[0] += ds[0]
      position[1] += ds[1]
      position[2] += ds[2]
    }
  }

  public createNextFn() {
    const { o3, velocity } = this
    const { position } = o3

    const writer = this.writer

    let loc = position.toArray()
    let velo = velocity.toArray()

    return () => {
      this.buffer(loc, velo)

      position.set(...loc)
      velocity.set(...velo)

      const distance = position.length() / AU
      writer.write(`distance: ${distance.toFixed(6)} AU`, 1)
      const speed = velocity.length() * 100
      writer.write(`speed: ${speed.toFixed(2)} km/s`, 2)
      writer.write(
        `period: ${this.periodText} / ${(this.s / 1000).toFixed(
          2
        )}s`,
        3
      )
      this.computeActualPeriod(speed)
    }
  }

  bootstrap() {
    const items: CelestialBody[] = []
    const add = (b: CelestialBody) => {
      items.push(b)
      for (const child of b.children) {
        items.push(child)
        add(child)
      }
    }

    add(this)

    items.shift()

    const fns = items.map((item) => {
      return item.createNextFn()
    })

    return () => {
      for (const fn of fns)
        fn()
    }
  }

  private children: CelestialBody[] = []
  public add(child: CelestialBody) {
    child.ref = this
    this.o3.add(child.o3)
    this.children.push(child)
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
    const position = this.o3.position
    position.set(aphelion, 0, 0)
    position.applyMatrix4(this.inclinationMat)
    const m = ref.mass
    const scalar =
      BEST_INITIAL_VELOCITY[this.info.name] ||
      Math.sqrt(G * m * (2 / aphelion - 1 / semiMajorAxis))
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
    return Math.sqrt((4 * pipi * aaa) / (G * M)) / K
  }
}
