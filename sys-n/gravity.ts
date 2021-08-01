import * as THREE from 'three'
import { Object3D } from 'three'
import { BodyInfo } from "../sys/body-info"
import { AU, SECONDS_IN_A_DAY } from "../sys/constants"
import { toThreeJSCSMat } from "./jpl-data"
import { path, peribelionAndAphelion, point, sphere, tail } from "./providers"
import { BUFFER_SIZE, BUFFER_MOMENT, MOMENT, SECONDS_IN_HOUR, G, ZERO_ACC } from './settings'

const noop = () => { }

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

export const insertCanvas = (info: BodyInfo, width: number = 200, height: number = 100) => {
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

  get elapse() {
    const { years, days, hours, seconds } = this
    let t = ''
    if (years > 0) t += years + 'y'
    if (days > 0) t += days + 'd'
    if (!t && hours > 0) t += hours + 'h'
    if (!t && seconds > 0) t += (0 ^ seconds) + 's'
    return t
  }

  get today() {
    if (this.delay) {
      return this.t
    }
    const { date } = this
    const month = date.getMonth() + 1
    const on = date.getDate()
    this.t = `${date.getFullYear()}/${month < 10 ? '0' + month : month}/${on < 10 ? '0' + on : on}`
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
        const added = Math.floor(this.hours / 24)
        this.days += added
        this.date.setDate(this.date.getDate() + added)
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
  tailO3: THREE.Line
  info: BodyInfo
  readonly sys: CelestialSystem
  readonly positionArr: THREE.Vector3Tuple = [0, 0, 0]
  readonly velocityArr: THREE.Vector3Tuple = [0, 0, 0]
  readonly orbitalAxis: THREE.Vector3
  private periodText: string = null
  private ticker = new TickableObject()

  // ref direction: J2000 ecliptic (1, 0, 0)
  readonly periapsis: THREE.Vector3
  readonly toPeriapsis: THREE.Matrix4
  readonly paO3: THREE.Points

  ref: CelestialBody | null = null
  private readonly initialAngleToRef: THREE.Vector3 = new THREE.Vector3()
  private state: 'normal' | 'reqStop' | 'stopped' = 'normal'

  private writer: { write: (txt: string, lineno?: number) => void }
  readonly moon: boolean = false
  readonly path: number[] = []
  private pathMaxLength: number = Number.MAX_SAFE_INTEGER
  private pathLength = 0

  get isRootBody() {
    return this.ref === null
  }

  get position(): THREE.Vector3 {
    return this.o3.position
  }

  constructor(system: CelestialSystem) {
    this.o3 = system.provider ? system.provider(system.body) : point(system.body)
    if (system.path)
      this.pathO3 = path(system.body)
    if (system.tail)
      this.tailO3 = tail(this.info)
    this.sys = system
    this.info = system.body
    this.moon = system.moon || false
    /**
     * 10^3 km/s
     */
    const refDirection = new THREE.Vector3(1, 0, 0) // J2000
    const toPeriapsis = new THREE.Matrix4()

    toPeriapsis.multiply(new THREE.Matrix4().makeRotationY(system.body.loan))
    toPeriapsis.multiply(new THREE.Matrix4().makeRotationX(system.body.inclination))
    toPeriapsis.multiply(new THREE.Matrix4().makeRotationY(system.body.aop))

    this.periapsis = refDirection.clone().applyMatrix4(toPeriapsis)
    this.toPeriapsis = toPeriapsis

    // this.paO3 = peribelionAndAphelion(this.info)
    // this.paO3.geometry.setAttribute('position', new THREE.Float32BufferAttribute(
    //   [
    //     ...this.periapsis.clone().setLength(this.info.peribelion).toArray(),
    //     ...this.periapsis.clone().negate().setLength(this.info.aphelion).toArray()
    //   ],
    //   3
    // ))
  }

  private initSpaceAttrs() {

    if (!this.sys.bootstrapState) {
      console.warn('oh no you\'ve forgotten the position and velocity.')
      return
    }

    const position = new THREE.Vector3(...this.sys.bootstrapState.posi).applyMatrix4(toThreeJSCSMat)
    const velocity = new THREE.Vector3(...this.sys.bootstrapState.velo.map(x => x / SECONDS_IN_A_DAY)).applyMatrix4(toThreeJSCSMat)

    this.positionArr[0] = position.x
    this.positionArr[1] = position.y
    this.positionArr[2] = position.z

    this.velocityArr[0] = velocity.x
    this.velocityArr[1] = velocity.y
    this.velocityArr[2] = velocity.z

    if (this.ref) { // or it's on the center
      this.initialAngleToRef.set(
        position.x - this.ref.positionArr[0],
        position.y - this.ref.positionArr[1],
        position.z - this.ref.positionArr[2]
      ).normalize()
    }
  }

  init(scene: THREE.Scene) {

    this.initSpaceAttrs()
    scene.add(this.o3)
    this.pathO3 && scene.add(this.pathO3)
    this.tailO3 && this.o3.add(this.tailO3)

    this.writer = insertCanvas(this.info, 200, 70)
    this.writer.write(this.info.name, 0)
    if (!this.ref) {
      this.writer.write('epoch: J2000', 1)
      this.writer.write('since: 2021-06-30 TDB', 2)
    }
    for (const child of this.children)
      child.init(scene)
  }

  showDistTo(o3: Object3D) {
    const pos0 = this.o3.position
    const pos1 = o3.position
    return () => {
      const dist = pos0.distanceTo(pos1)
      this.writer.write(`far: ${dist.toFixed(6)}`, 4)
    }
  }

  private readonly currentAngleToRef = new THREE.Vector3()
  private s: number = 0
  private stage = 0
  private regressed = false
  private checkAngleToRefRegress() {
    if (this.isRootBody || this.regressed) return

    const { positionArr, ref } = this
    const { positionArr: refPositionArr } = ref

    const nearEqualToZero = this.currentAngleToRef
      .set(
        this.positionArr[0] - refPositionArr[0],
        positionArr[1] - refPositionArr[1],
        positionArr[2] - refPositionArr[2]
      )
      .angleTo(this.initialAngleToRef) < .01

    if (this.stage === 0 && !nearEqualToZero) {
      this.stage = 1
    }

    if (nearEqualToZero && this.stage === 1) {
      this.regressed = true
    }
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

      this.checkAngleToRefRegress()
    }
  }

  private log(...args: unknown[]) {
    console.log(this.info.name, ...args)
  }

  private createNextFn() {
    const { ticker, writer, positionArr } = this
    const { position } = this.o3

    const renderPath = this.createPathRenderFn()
    const renderText = this.createTextRenderFn()
    const renderRotation = this.createRotationRenderFn()

    return () => {
      ticker.tick()

      if (this.ref === null) { // is sun or center
        writer.write(`date: ${ticker.today}`, 3)
        writer.write(`elapse: ${ticker.elapse}`, 4)
        renderRotation()
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
      renderPath()
      renderText()
      renderRotation()
    }
  }
  private nextFn: () => void

  private createPathRenderFn() {
    if (!this.pathO3) return noop
    const { positionArr, path, pathO3 } = this
    const { geometry } = pathO3
    let gap = 0
    return () => {
      gap += 1
      if (gap % 5 === 0) {
        gap = 0
      }
      // path.push(...positionArr)
      // geometry.setAttribute('position', new THREE.Float32BufferAttribute(path, 3))
    }
  }

  private createRotationRenderFn() {
    if (!this.sys.rotates) return noop
    const { o3, info } = this
    const rotation = o3.rotation
    const rad = BUFFER_MOMENT * Math.PI / (info.rotationPeriod * SECONDS_IN_A_DAY)
    return () => {
      rotation.y += rad
    }
  }

  private createTextRenderFn() {
    const { path, ticker, writer, positionArr, velocityArr } = this
    this.s = performance.now()
    return () => {
      if (this.periodText === null && this.regressed) {
        this.s = performance.now() - this.s
        this.periodText = `${(this.s / 1000).toFixed(2)}s/${ticker.elapse}`
        this.pathMaxLength = path.length / 3
      }

      const distance = computeVec3Length(positionArr) / AU
      writer.write(`distance: ${distance.toFixed(6)} AU`, 1)
      const speed = computeVec3Length(velocityArr) * 1000
      writer.write(`speed: ${speed.toFixed(2)} km/s`, 2)
      writer.write(`period: ${this.periodText || '...'}`, 3)
    }
  }

  protected initialGravityCaringObjects() {
    this.traverseAncestors(b => {
      this.gravityCaringObjects.push(b)
    })
    this.traverse((b) => {
      if (b.moon) {
        this.gravityCaringObjects.push(b)
      }
    }, 1)
  }

  public traverse(fn: (b: CelestialBody) => void, maxDepth = 1, depth = 0) {
    fn(this)
    if (depth === maxDepth) return
    for (const child of this.children) {
      child.traverse(fn, maxDepth, depth + 1)
    }
  }

  public traverseAncestors(fn: (b: CelestialBody) => void) {
    let ref = this.ref
    while (ref) {
      fn(ref)
      ref = ref.ref
    }
  }

  static createUniNextFn(root: CelestialBody) {
    const bodies: CelestialBody[] = []
    const centerPosi: THREE.Vector3Tuple = [...root.positionArr]
    const centerVelo: THREE.Vector3Tuple = [...root.velocityArr]
    const iter = (b: CelestialBody) => {
      setVec3RelativeTo(b.positionArr, centerPosi)
      setVec3RelativeTo(b.velocityArr, centerVelo)
      bodies.push(b)
      b.o3.position.set(...b.positionArr)
      b.initialGravityCaringObjects()
      b.nextFn = b.createNextFn()
      for (const child of b.children) {
        iter(child)
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
      for (const b of bodies) {
        b.nextFn()
      }
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

export function computeAccBy(
  position0: THREE.Vector3Tuple,
  position: THREE.Vector3Tuple,
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

  if (radius > length) return ZERO_ACC

  const scalar = (G * mass) / r2
  const factor = scalar / length
  return [dx * factor, dy * factor, dz * factor]
}

export function computeVec3Length(vec: THREE.Vector3Tuple) {
  const [x, y, z] = vec
  return Math.sqrt(x * x + y * y + z * z)
}

export function setVec3RelativeTo(vec: THREE.Vector3Tuple, to: THREE.Vector3Tuple): THREE.Vector3Tuple {
  vec[0] -= to[0]
  vec[1] -= to[1]
  vec[2] -= to[2]
  return vec
}

export function computeAccOfCelestialBody(self: CelestialBody) {
  const sum: THREE.Vector3Tuple = [0, 0, 0]
  const pos = self.positionArr
  for (const obj of self.gravityCaringObjects) {
    const a = computeAccBy(pos, obj.positionArr, obj.info.mass, obj.info.radius)
    sum[0] += a[0]
    sum[1] += a[1]
    sum[2] += a[2]
  }
  return sum
}
