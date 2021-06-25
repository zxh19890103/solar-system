import { BodyInfo } from "../sys/body-info"
import { AU } from "../sys/constants"

type ARRAY_VECTOR3 = [number, number, number]

const G = 6.67 * 0.001

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

    this.writer = insertCanvas(this.info)
  }

  private computeAccByRef(
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

  private buffer() {
    let n = 100
    const dt = 100

    const deltaV: ARRAY_VECTOR3 = [0, 0, 0]
    const deltaP: ARRAY_VECTOR3 = [0, 0, 0]
    
    const posi = this.o3.getWorldPosition(new THREE.Vector3()).toArray()
    const a: ARRAY_VECTOR3 = [0, 0, 0]
    
    const getAcc = this.computeAccByRef
    
    let ref = this.ref
    while (ref) {
      const refPosi = ref.o3.getWorldPosition(new THREE.Vector3()).toArray()
      const da = getAcc(posi, refPosi, ref.info.mass)
      a[0] += da[0]
      a[1] += da[1]
      a[2] += da[2]

      ref = ref.ref
    }

    while (n--) {
      const dv = a.map((c) => c * dt)
      const [vx, vy, vz] = deltaV
      const [dvx, dvy, dvz] = dv
      const ds = [
        vx * dt + 0.5 * dvx * dt,
        vy * dt + 0.5 * dvy * dt,
        vz * dt + 0.5 * dvz * dt,
      ]

      deltaV[0] += dv[0]
      deltaV[1] += dv[1]
      deltaV[2] += dv[2]

      deltaP[0] += ds[0]
      deltaP[1] += ds[1]
      deltaP[2] += ds[2]
    }

    return [deltaV, deltaP]
  }

  public next() {
    console.log(this.info.name, "next")
    const [dv, dp] = this.buffer()

    this.o3.position.add(new THREE.Vector3(dp[0], dp[1], dp[2]))

    this.velocity.add(new THREE.Vector3(dv[0], dv[1], dv[2]))

    const writer = this.writer
    const distance = this.o3.position.length() / AU
    writer.write(`distance: ${distance.toFixed(6)} AU`, 1)
    const speed = this.velocity.length() * 100
    writer.write(`speed: ${speed.toFixed(2)} km/s`, 2)
    writer.write(
      `period: ${this.period.toFixed(2)} year(s) / ${(this.s / 1000).toFixed(
        2
      )}s`,
      3
    )

    this.computeActualPeriod(speed)
  }

  run() {
    if (this.ref) this.next()
    for (const child of this.children) {
      child.run()
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
    console.log(this.info.name, ...position.toArray())
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
