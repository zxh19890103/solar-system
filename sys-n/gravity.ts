import { BodyInfo } from "../sys/body-info"
import { AU } from "../sys/constants"

const G = 6.67 * .00001 // be sure the velocity's unit is km/s
const BUFFER_SIZE = 100
const MOMENT = 100 // s

/**
 * seconds
 */
const BUFFER_MOMENT = BUFFER_SIZE * MOMENT
const SECONDS_IN_HOUR = 60 * 60

const setupDisplay = () => {
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

  return div
}

const displayDiv = setupDisplay()

const insertCanvas = (info: BodyInfo, width: number = 200, height: number = 100) => {
  const dpr = window.devicePixelRatio
  const canvas = document.createElement("canvas")
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.cssText = `width: ${width}px; height: ${height}px; position: static;`
  const ctx = canvas.getContext("2d")
  ctx.scale(dpr, dpr)
  displayDiv.appendChild(canvas)
  const color = "rgba(" + info.color.map((x) => 0 ^ (x * 255)).join(",") + ")"
  ctx.fillStyle = color
  ctx.textBaseline = "top"
  const h = 13
  ctx.font = `${h - 1}px / 1 Wawati SC`

  return {
    write: (txt: string, lineno = 1) => {
      ctx.clearRect(0, h * lineno, width, h)
      ctx.fillText(txt, 0, h * lineno, width)
    },
  }
}

class TickableObject {
  private seconds = 0
  private hours = 0
  private years = 0
  private days = 0
  private date = new Date(2021, 5, 30)
  private t = '...'
  private delay = false

  constructor() {
    this.date.setFullYear(2021)
    this.date.setMonth(5)
    this.date.setDate(30)
  }

  get elapse() {
    const { years, days, hours } = this
    let t = ''
    if (years > 0) t += years + 'y'
    if (days > 0) t += days + 'd'
    if (!t && hours > 0) t += hours + 'h'
    return t
  }

  get today() {
    if (this.delay) {
      return this.t
    }
    const { date, years, days } = this
    date.setFullYear(2021 + years)
    date.setDate(30 + days)
    this.t = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    this.delay = true
    setTimeout(() => {
      this.delay = false
    }, 500)
    return this.t
  }

  tick() {
    const sec = this.seconds
    let nextSec = sec + BUFFER_MOMENT
    if (nextSec >= SECONDS_IN_HOUR) {
      this.hours += Math.floor(nextSec / SECONDS_IN_HOUR)
      if (this.hours >= 24) {
        this.days += Math.floor(this.hours / 24)
        this.hours = this.hours % 24
        if (this.days >= 365) {
          this.years += 1
          this.days = this.days % 365
        }
      }
      nextSec = nextSec % SECONDS_IN_HOUR
    }
    this.seconds = nextSec
  }
}

export class CelestialBody {
  o3: THREE.Object3D
  pathO3: THREE.Points
  info: BodyInfo
  readonly positionArr: THREE.Vector3Tuple = [0, 0, 0]
  readonly velocityArr: THREE.Vector3Tuple = [0, 0, 0]
  readonly orbitalAxis: THREE.Vector3
  private periodText: string = null
  private ticker = new TickableObject()

  // ref direction: J2000 ecliptic (1, 0, 0)
  readonly periapsis: THREE.Vector3
  readonly toPeriapsis: THREE.Matrix4

  ref: CelestialBody | null = null
  private readonly initialAngleToRef: THREE.Vector3 = new THREE.Vector3()
  private state: 'normal' | 'reqStop' | 'stopped' = 'normal'

  private writer: { write: (txt: string, lineno?: number) => void }
  readonly moon: boolean = false
  readonly path: number[] = []
  private pathMaxLength: number = Number.MAX_SAFE_INTEGER
  private pathLength = 0

  constructor(o3: THREE.Object3D, info: BodyInfo, moon: boolean) {
    this.o3 = o3
    this.info = info
    this.moon = moon
    /**
     * 10^3 km/s
     */
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
        this.positionArr[0] = position.x
        this.positionArr[1] = position.y
        this.positionArr[2] = position.z

        this.velocityArr[0] = velocity.x
        this.velocityArr[1] = velocity.y
        this.velocityArr[2] = velocity.z

        this.o3.position.copy(position)

        this.initialAngleToRef.set(
          position.x - this.ref.positionArr[0],
          position.y - this.ref.positionArr[1],
          position.z - this.ref.positionArr[2]
        ).normalize()
      } else {
        this.log('no position & velocity given')
      }
    }

    this.writer = insertCanvas(this.info, 200, 70)
    this.writer.write(this.info.name, 0)
    if (!this.ref) {
      this.writer.write('epoch: J2000', 1)
      this.writer.write('since: 2021-06-30 TDB', 2)
    }
  }

  private readonly currentAngleToRef = new THREE.Vector3()
  private s: number = 0
  private stage = 0
  private checkAngleToRefRegress() {
    const nearEqualToZero = this.currentAngleToRef
      .set(
        this.positionArr[0] - this.ref.positionArr[0],
        this.positionArr[1] - this.ref.positionArr[1],
        this.positionArr[2] - this.ref.positionArr[2]
      )
      .angleTo(this.initialAngleToRef) < .01

    if (this.stage === 0 && !nearEqualToZero) {
      this.stage = 1
    }

    return nearEqualToZero && this.stage === 1
  }

  private buffer(position: THREE.Vector3Tuple, velocity: THREE.Vector3Tuple, N = 1) {

    let n = N
    const posiArr = position
    const veloArr = velocity

    while (n--) {
      const a = computeAccOfCelestialBody(this)
      if (a === null) {
        this.state = 'reqStop'
        veloArr[0] = 0
        veloArr[1] = 0
        veloArr[2] = 0
        break
      }
      const dv = [
        a[0] * MOMENT,
        a[1] * MOMENT,
        a[2] * MOMENT
      ]
      const [vx, vy, vz] = veloArr
      const [dvx, dvy, dvz] = dv
      const ds = [
        vx * MOMENT + 0.5 * dvx * MOMENT,
        vy * MOMENT + 0.5 * dvy * MOMENT,
        vz * MOMENT + 0.5 * dvz * MOMENT,
      ]

      veloArr[0] += dv[0]
      veloArr[1] += dv[1]
      veloArr[2] += dv[2]

      posiArr[0] += ds[0]
      posiArr[1] += ds[1]
      posiArr[2] += ds[2]
    }
  }

  private log(...args: unknown[]) {
    console.log(this.info.name, ...args)
  }

  public createNextFn() {
    const { o3, velocityArr, ticker, writer, positionArr, path, pathO3 } = this
    const { position } = o3
    const { geometry: pathGeo } = pathO3 || { geometry: null }

    this.s = performance.now()

    return () => {
      ticker.tick()

      if (this.ref === null) { // is sun or center
        writer.write(`date: ${ticker.today}`, 3)
        writer.write(`elapse: ${ticker.elapse}`, 4)
        return
      }

      if (this.state === 'stopped') {
        this.log('was stopped')
        return
      }

      if (this.state === 'reqStop') {
        this.log('will be stopped')
        this.state = 'stopped'
      }

      position.set(...positionArr)
      if (pathGeo) {
        path.push(...positionArr)
        if (this.pathLength === this.pathMaxLength) {
          path.shift()
          path.shift()
          path.shift()
        } else {
          this.pathLength += 1
        }
        pathGeo.setAttribute('position', new THREE.Float32BufferAttribute(path, 3))
      }


      if (this.periodText === null && this.checkAngleToRefRegress()) {
        this.s = performance.now() - this.s
        this.periodText = `${(this.s / 1000).toFixed(2)}s/${ticker.elapse}`
        this.pathMaxLength = path.length / 3
      }

      const distance = position.length() / AU
      writer.write(`distance: ${distance.toFixed(6)} AU`, 1)
      const speed = computeVec3Length(velocityArr) * 1000
      writer.write(`speed: ${speed.toFixed(2)} km/s`, 2)
      writer.write(`period: ${this.periodText || '...'}`, 3)
    }
  }

  static createUniNextFn(scene: THREE.Scene, root: CelestialBody) {
    const bodies: CelestialBody[] = []
    const fns: VoidFunction[] = []
    const iter = (b: CelestialBody) => {
      bodies.push(b)
      if (b.o3)
        scene.add(b.o3)
      if (b.pathO3)
        scene.add(b.pathO3)
      collectAllAncestors(b)
      fns.push(b.createNextFn())
      for (const child of b.children) {
        if (child.moon) {
          b.gravityCaringObjects.push(child)
        }
        iter(child)
      }
    }

    const collectAllAncestors = (b: CelestialBody) => {
      let ref = b.ref
      while (ref) {
        b.gravityCaringObjects.push(ref)
        ref = ref.ref
      }
    }

    iter(root)

    return () => {
      let n = BUFFER_SIZE
      while (n--) {
        for (const b of bodies) {
          b.buffer(b.positionArr, b.velocityArr, 1)
        }
      }
      for (const fn of fns)
        fn()
    }
  }

  readonly gravityCaringObjects: CelestialBody[] = []
  readonly children: Set<CelestialBody> = new Set()
  public add(child: CelestialBody) {
    child.ref = this
    this.children.add(child)
  }
  public find(name: string) {
    for (const child of this.children) {
      if (child.info.name === name)
        return child
    }
    return null
  }
}

const ZERO_ACC = [0, 0, 0]

export function computeAccBy(
  position0: THREE.Vector3Tuple,
  position: THREE.Vector3Tuple,
  mass: number
) {

  if (mass === 0) return ZERO_ACC

  const [x, y, z] = position0
  const [rx, ry, rz] = position
  const dx = rx - x,
    dy = ry - y,
    dz = rz - z
  const r2 = (dx) * (dx) + (dy) * (dy) + (dz) * (dz)
  const length = Math.sqrt(r2)

  const scalar = (G * mass) / r2
  const factor = scalar / length
  return [dx * factor, dy * factor, dz * factor]
}

export function computeVec3Length(vec: THREE.Vector3Tuple) {
  const [x, y, z] = vec
  return Math.sqrt(x * x + y * y + z * z)
}

export function computeAccOfCelestialBody(self: CelestialBody) {
  const sum: THREE.Vector3Tuple = [0, 0, 0]
  const pos = self.positionArr
  for (const obj of self.gravityCaringObjects) {
    const a = computeAccBy(pos, obj.positionArr, obj.info.mass)
    sum[0] += a[0]
    sum[1] += a[1]
    sum[2] += a[2]
  }
  return sum
}
