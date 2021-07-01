import { BodyInfo } from "../sys/body-info"
import { AU, SECONDS_IN_A_DAY } from "../sys/constants"
import { toJ2000CSMat } from "./jpl-data"

type ARRAY_VECTOR3 = THREE.Vector3Tuple

const G = 6.67 * .00001 // be sure the velocity's unit is km/s
const BUFFER_SIZE = 1000
const MOMENT = 100 // s

/**
 * seconds
 */
const BUFFER_MOMENT = BUFFER_SIZE * MOMENT

/**
 * one year on earth equals this value.
 * 365 * 24 * 60 * 60
 */
const K = 31567699.59

const BEST_INITIAL_VELOCITY = {
  Mecury: 0.387,
  Venus: 0.346,
  Earth: 0.0289,
  Mars: 0.2178,
  Jupiter: 0.123,
  Saturn: 0.0902,
  Uranus: 0.065,
  Neptune: 0.0533,
  Luna: .000004
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

const insertCanvas = (info: BodyInfo, width: number = 200, height: number = 100) => {
  const dpr = window.devicePixelRatio
  const canvas = document.createElement("canvas")
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.cssText = `width: ${width}px; height: ${height}px; position: static;`
  const ctx = canvas.getContext("2d")
  ctx.scale(dpr, dpr)
  div.appendChild(canvas)
  const color = "rgba(" + info.color.map((x) => 0 ^ (x * 255)).join(",") + ")"
  ctx.fillStyle = color
  ctx.textBaseline = "top"
  const h = 13
  ctx.font = `${h - 1}px / 1 Wawati SC`
  ctx.fillText(info.name, 0, 0, 200)

  return {
    write: (txt: string, lineno = 1) => {
      ctx.clearRect(0, h * lineno, width, h)
      ctx.fillText(txt, 0, h * lineno, width)
    },
  }
}

/**
 * seconds
 */
let clock: number = 0
let days: number = 0

export const dida = () => {
  // 1/60 s
  clock += BUFFER_MOMENT
  if (clock > SECONDS_IN_A_DAY) {
    days += 1
    clock = clock % SECONDS_IN_A_DAY
  }
}

export class CelestialBody {
  o3: THREE.Object3D
  info: BodyInfo
  readonly velocity: THREE.Vector3
  readonly orbitalAxis: THREE.Vector3
  scene: THREE.Scene
  period: number = 0
  periodText: string = ''

  // ref direction: J2000 ecliptic (1, 0, 0)
  readonly periapsis: THREE.Vector3
  readonly toPeriapsis: THREE.Matrix4

  ref: CelestialBody = null
  state: 'normal' | 'reqStop' | 'stopped' = 'normal'

  writer: { write: (txt: string, lineno?: number) => void }

  constructor(o3: THREE.Object3D, info: BodyInfo) {
    this.o3 = o3
    this.info = info
    /**
     * 10^3 km/s
     */
    this.velocity = new THREE.Vector3(0, 0, 0)
    const refDirection = new THREE.Vector3(1, 0, 0) // J2000
    const toPeriapsis = new THREE.Matrix4()

    toPeriapsis.multiply(new THREE.Matrix4().makeRotationY(info.loan))
    toPeriapsis.multiply(new THREE.Matrix4().makeRotationX(info.inclination))
    toPeriapsis.multiply(new THREE.Matrix4().makeRotationY(info.aop))

    this.periapsis = refDirection.clone().applyMatrix4(toPeriapsis)
    this.toPeriapsis = toPeriapsis
  }

  init(position?: THREE.Vector3, velocity?: THREE.Vector3) {
    if (this.ref) { // or it's on the center
      if (position && velocity) {
        this.o3.position.copy(position)
        this.velocity.copy(velocity)
      } else {
        this.putObjectOnAphelion()
      }
      this.period = this.computePeriod()
    }

    this.writer = insertCanvas(this.info)
  }

  private buffer(position: THREE.Vector3Tuple, velocity: THREE.Vector3Tuple) {

    let n = BUFFER_SIZE

    const ref = this.ref
    const { mass, radius } = ref ? ref.info : { mass: 0, radius: 0 }
    const origin: THREE.Vector3Tuple = [0, 0, 0]

    while (n--) {
      const a = computeAccBy(position, origin, mass, radius)
      if (a === null) {
        this.state = 'reqStop'
        velocity[0] = 0
        velocity[1] = 0
        velocity[2] = 0
        break
      }
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

    return () => {

      if (this.deleted) return
      if (this.state === 'stopped') return

      let loc = position.toArray()
      let velo = velocity.toArray()

      this.buffer(loc, velo)

      if (this.state === 'reqStop') {
        this.ref.acceptMaterial(this)
        this.state = 'stopped'
      }

      position.set(...loc)
      velocity.set(...velo)

      const distance = position.length() / AU
      writer.write(`distance: ${distance.toFixed(6)} AU`, 1)
      const speed = velocity.length() * 1000
      writer.write(`speed: ${speed.toFixed(2)} km/s`, 2)
      writer.write(`period: ${(this.s / 1000).toFixed(2)}s / ${this.periodText}`, 3)
      writer.write(`time: ${(days)} days`, 4)
      this.measureActualPeriod(speed)

      if (this.stage === 8 && !this.periodText) {
        this.periodText = days + 'days'
      }
    }
  }

  acceptMaterial(body: CelestialBody) {
    const q = body.velocity.multiplyScalar(body.info.mass)
    const m = this.info.mass + body.info.mass
    const v = q.divideScalar(m)
    this.velocity.add(v)
    this.remove(body)
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

    const fns = items.map((item) => {
      return item.createNextFn()
    })

    return () => {
      for (const fn of fns)
        fn()
    }
  }

  private children: Set<CelestialBody> = new Set()
  public add(child: CelestialBody) {
    child.ref = this
    this.o3.add(child.o3)
    this.children.add(child)
  }

  private deleted: boolean = false
  private remove(child: CelestialBody) {
    child.deleted = true
    this.o3.remove(child.o3)
    this.children.delete(child)
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
    const { ref, semiMajorAxis, peribelion } = this.info
    const position = this.o3.position
    position.set(peribelion, 0, 0)
    position.applyMatrix4(this.toPeriapsis)
    const m = ref.mass
    const scalar = BEST_INITIAL_VELOCITY[this.info.name] || Math.sqrt(G * m * (2 / peribelion - 1 / semiMajorAxis))
    this.velocity.set(0, 0, scalar)
    this.velocity.applyMatrix4(this.toPeriapsis)
  }

  private stage: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 = 0
  private lastSpeed = 0
  private s: number = 0

  private measureActualPeriod(speed: number) {
    if (this.stage === 8) return
    switch (this.stage) {
      case 0: {
        this.stage = 1
        break
      }
      case 1: {
        // justify
        if (speed < this.lastSpeed) {
          // to A
          this.stage = 2
        } else {
          // to P
          this.stage = 3
        }
        break
      }
      case 2: {
        // @A
        if (speed > this.lastSpeed) {
          this.s = performance.now()
          this.stage = 4
        }
        break
      }
      case 3: {
        // @P
        if (speed < this.lastSpeed) {
          this.s = performance.now()
          this.stage = 6
        }
        break
      }
      case 4: {
        // a -> p
        // @P
        if (speed < this.lastSpeed) {
          this.stage = 5
        }
        break
      }
      case 5: {
        // p -> a
        // @A
        if (speed > this.lastSpeed) {
          this.s = performance.now() - this.s
          this.stage = 8
        }
        break
      }
      case 6: {
        // p -> a
        // @A
        if (speed > this.lastSpeed) {
          this.stage = 7
        }
        break
      }
      case 7: {
        // a -> p
        // @P
        if (speed < this.lastSpeed) {
          this.s = performance.now() - this.s
          this.stage = 8
        }
        break
      }
      default: {
        break
      }
    }

    if (this.stage < 8)
      this.lastSpeed = speed
  }

  private computePeriod() {
    // t2 = (4PI2 * a * 3) / GM
    const pipi = Math.PI ** 2
    const aaa = this.info.semiMajorAxis ** 3
    const M = this.ref.info.mass
    return Math.sqrt((4 * pipi * aaa) / (G * M)) / K
  }
}

const ZERO_ACC = [0, 0, 0]

export function computeAccBy(
  position0: ARRAY_VECTOR3,
  position: ARRAY_VECTOR3,
  mass: number,
  radius: number
) {

  if (mass === 0) return ZERO_ACC

  const [x, y, z] = position0
  const [rx, ry, rz] = position
  const dx = rx - x,
    dy = ry - y,
    dz = rz - z
  const r2 = (dx) * (dx) + (dy) * (dy) + (dz) * (dz)
  const length = Math.sqrt(r2)

  if (length < radius) {
    return null
  }

  const scalar = (G * mass) / r2
  const factor = scalar / length
  return [dx * factor, dy * factor, dz * factor]
}

/**
 * m1v1 + m2v2 = mv
 */