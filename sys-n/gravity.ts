import { BodyInfo } from "../sys/body-info"
import { AU } from "../sys/constants"

type ARRAY_VECTOR3 = THREE.Vector3Tuple

const G = 6.67 * 0.001
const BUFFER_SIZE = 100
const MOMENT = 50

/**
 * https://www.theplanetstoday.com/Scripts/data.php
 * 
 * returns
 * 
 * var names = [["Sol",46],["Earth",30.1],["Luna",13.55],["Mercury",13.35],["Venus",15.5],["Mars",14.5],["Jupiter",40.9],["Saturn ",31.1],["Uranus",26],["Neptune",18.1],["Ceres",5.9],["Pluto",5.9],["Haumea",5.9],["Makemake",5.9],["Eris",5.9]]; 
 * var data = [
 *  ["${date}", 400, 400, 0, (x,y,0){14},.0000003]
 * ]
 */

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
  readonly velocity: THREE.Vector3
  readonly orbitalAxis: THREE.Vector3
  readonly inclinationMat: THREE.Matrix4
  scene: THREE.Scene
  period: number = 0
  periodText: string = '--'

  ref: CelestialBody = null
  state: 'normal' | 'reqStop' | 'stopped' = 'normal'

  writer: { write: (txt: string, lineno?: number) => void }

  constructor(o3: THREE.Object3D, info: BodyInfo) {
    this.o3 = o3
    this.info = info
    this.velocity = new THREE.Vector3(0, 0, 0)
    this.orbitalAxis = new THREE.Vector3(0, 1, 0)
    this.inclinationMat = new THREE.Matrix4()
  }

  init() {
    const refPlane = new THREE.Vector3(0.3, 0, 1)
    this.inclinationMat.makeRotationAxis(refPlane, this.info.inclination)
    this.orbitalAxis.applyMatrix4(this.inclinationMat)

    if (this.ref) { // or it's on the center
      this.putObjectOnAphelion()
      this.period = this.computePeriod()
      this.periodText = this.period < .5 ? `${(this.period * 365).toFixed(2)} days` : `${this.period.toFixed(2)} years`
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
      const speed = velocity.length() * 100
      writer.write(`speed: ${speed.toFixed(2)} km/s`, 2)
      writer.write(
        `period: ${this.periodText} / ${(this.s / 1000).toFixed(
          2
        )}s`,
        3
      )
      if (this.ref) {
        this.computeActualPeriod(speed)
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
    const { ref, semiMajorAxis, aphelion } = this.info
    const position = this.o3.position
    position.set(aphelion, 0, 0)
    position.applyMatrix4(this.inclinationMat)
    const m = ref.mass
    const scalar =
      BEST_INITIAL_VELOCITY[this.info.name] ||
      Math.sqrt(G * m * (2 / aphelion - 1 / semiMajorAxis))
    this.velocity.set(0, 0, scalar)
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