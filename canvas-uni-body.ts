import { BodyInfo, Sun } from "./canvas-uni-8"
import { CameraSys } from "./canvas-uni-camera"
import {
  AU,
  DAYS_OF_EARTH_YEAR,
  MIN_INTENSITY,
  GRAVITY_CONST,
  MASS_OF_SUN,
  UNIT_OF_TIME,
  RENDER_PERIOD,
  DAYS_PER_SECOND,
  BODY_SIZE_COEFFICIENT,
  CANVAS_FILL_PRECISION,
  SECONDS_IN_A_DAY
} from "./canvas-uni-constants"
import { Ether } from "./canvas-uni-ether"
import { rand } from "./canvas-uni-utils"
import { Vector } from "./canvas-uni-vector"

const { PI, sqrt, cos, sin, abs, round } = Math

export class CelestialBody {
  name: string = "unknown"
  coord: Vector
  mass: number
  radius: number
  watches: CelestialBody[]
  velocity: Vector
  ether: Ether
  satellites: CelestialBody[] = []
  inf: BodyInfo

  constructor(name: string, coord: Vector, velocity: Vector, mass: number, radius: number) {
    this.name = name
    this.watches = []
    this.mass = mass
    this.radius = radius
    this.velocity = velocity
    this.coord = coord
  }

  move() {
    // debugger
    // km
    const dS = this.velocity.cloneAndScale(UNIT_OF_TIME)
    const fi = this.computeComposedIntensity()
    if (fi.mag() === 0) {
      // nothing.
    } else {
      const dV = fi.cloneAndScale(UNIT_OF_TIME)
      const dS1 = dV.cloneAndScale(.5 * UNIT_OF_TIME)
      dS.add(dS1)
      // and velocity changes
      this.velocity.add(dV)
    }
    // coordinates changes
    // console.log(dS.z)
    this.coord.add(dS.scale(.001))
  }

  notify() {
    const bodies = this.watches
    let i = bodies.length
    let body: CelestialBody = null
    while (i--) {
      body = bodies[i]
      body.accept(this)
    }
  }

  /**
   * you need transform it's:
   *  - velocity
   *  - coord
   */
  addSatellite(b: CelestialBody) {
    this.satellites.push(b)
  }

  setupSatellites() {
    if (this.satellites.length === 0) return
    this.satellites.forEach(satellite => {
      satellite.coord.add(this.coord)
      satellite.velocity.add(this.velocity)
    })
  }

  accept(body: CelestialBody) {
    // wait all movement is fin. 
  }

  watch(body: CelestialBody) {
    this.watches.push(body)
  }

  unWatch(body: CelestialBody) {
    const index = this.watches.indexOf(body)
    if (index === -1) return
    this.watches.splice(index, 1)
  }

  computeComposedIntensity() {
    const bodies = this.watches
    let i = bodies.length
    let fi = new Vector()
    while (i--) {
      const fi1 = this.computeFieldIntensityFromBody(bodies[i])
      fi.add(fi1)
    }
    return fi
  }

  computeFieldIntensityFromBody(b: CelestialBody) {
    const r = b.coord.diff(this.coord).mag()
    /**
     * this unit would be m/s2
     * to be km/s2
     * we cross it by .001
     */
    let intensity = (.001 * GRAVITY_CONST * b.mass) / (r * r)
    if (intensity < MIN_INTENSITY) intensity = 0
    return b.coord.diff(this.coord).withMag(intensity)
  }
}

/**
 *  v = sqrt(GM(2/r - 1/a))
 * @param sma Semi-major axis, unit: x 10 ^ 3 km
 * @param r the distance from the center body. unit: x 10 ^ 3 km
 * @returns unit is km/s
 */
const computesOrbitSpeedOnR = (sma: number, r: number, ref?: BodyInfo) => {
  if (sma === 0) return 0
  const m = ref ? ref.mass : MASS_OF_SUN
  return sqrt(GRAVITY_CONST * m * (2 / r - 1 / sma))
}

/**
 * T^2 = a^3
 * @param sma unit: 10^3 km
 * @returns unit: days
 */
const computesOrbitalPeriod = (sma: number, ref: BodyInfo) => {
  const a = sma // * pow(10, 6)
  const g = GRAVITY_CONST //  * pow(10, -12)
  const m = (ref ? ref.mass : Sun.mass) // * pow(10, 24)
  return (PI * 2 * sqrt(1000000 * a * a * a / (g * m))) / (SECONDS_IN_A_DAY)
}

const duration = (seconds: number) => {
  if (seconds < 1) return '1sec'
  const overs = [60, 60, 24, 1]
  const units = ['sec', 'min', 'hr', 'dy']
  let rem = 0 ^ seconds
  let m = 0
  let exp = ""
  while (m = overs.shift()) {
    exp = `${rem % m} ${units.shift()}${exp}`
    rem = 0 ^ (rem / m)
    if (rem === 0) break
  }
  return exp
}

export interface CreateBodyReturns {
  body: CelestialBody
  ctx: CanvasRenderingContext2D
  prepare: () => Promise<void>
  run: () => void
}

export const createBody = (inf: BodyInfo, ctx: CanvasRenderingContext2D): CreateBodyReturns => {
  const {
    name,
    mass,
    aphelion,
    color
  } = inf

  const velocity = new Vector()
  const coord = new Vector()
  const body = new CelestialBody(name, coord, velocity, mass, inf.radius)
  body.inf = inf

  const R = inf.dispayRadiusTimes ? inf.radius * inf.dispayRadiusTimes : inf.radius
  const canvasElement = ctx.canvas

  let ticks = 0
  let [x, y] = [null, null]
  let r = R
  let [lastX, lastY, lastR] = [x, y, R]
  let camera: CameraSys = null
  let fill: () => void = () => { }
  let ether: Ether = null

  const loop = () => {
    if (!inf.stick) {
      while (--ticks > 0) {
        body.move()
      }
      ticks = RENDER_PERIOD
    }
    project()
    if (x === null || y === null) {
      clearFill()
    } else {
      if ((x - lastX) * (x - lastX) + (y - lastY) * (y - lastY) < CANVAS_FILL_PRECISION) {
        // not
      } else {
        clearFill()
        fill()
        saveLastFill()
      }
    }
    requestAnimationFrame(loop)
  }

  const saveLastFill = () => {
    lastX = x
    lastY = y
    lastR = r
  }

  const clearFill = () => {
    if (lastX === null || lastY === null) return
    const rectR = lastR + 1 + 400
    ctx.clearRect(
      lastX - (rectR),
      lastY - (rectR),
      rectR * 2,
      rectR * 2
    )
  }

  const fillBall = () => {
    if (x === null || y === null) return
    ctx.beginPath()
    ctx.arc(x, y, r, 0, PI * 2)
    ctx.fill()
    ctx.fillText(name, x + r, y - r)
  }

  const fillAvatar = () => {
    if (x === null || y === null) return
    ctx.drawImage(
      avatar,
      0, 0,
      avatarWidth, avatarHeight,
      x - r, y - r,
      r * 2,
      r * 2 * avatorHWRatio
    )
    ctx.fillText(name, x + r, y - r)
  }

  const project = () => {
    const point3d = coord.toPoint()
    const point2d = camera.project(...point3d)
    if (point2d[0] === null) {
      x = null
      y = null
    } else {
      x = point2d[0]
      y = point2d[1]
    }
    ether.ctx.fillStyle = color
    ether.setLayersOrder(name, canvasElement, point2d[3], inf.index)
    r = inf.sizeInPixels ? inf.sizeInPixels : (R * BODY_SIZE_COEFFICIENT * point2d[2])
  }

  let avatar: HTMLImageElement = null
  let avatarWidth = 0
  let avatarHeight = 0
  let avatorHWRatio = 1
  const loadAvatar = () => {
    return new Promise(r => {
      if (!inf.avatar) return r(null)
      avatar = new Image()
      avatar.src = inf.avatar
      avatar.onload = () => {
        avatar.onload = null
        avatarWidth = avatar.naturalWidth
        avatarHeight = avatar.naturalHeight
        avatorHWRatio = avatarHeight / avatarWidth
        r(null)
      }
    })
  }

  const prepare = async () => {
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 1
    ctx.font = "18px Kristen ITC"

    ether = body.ether
    camera = ether.camera

    await loadAvatar()

    fill = avatar === null ? fillBall : fillAvatar

    const speedOnAphe = computesOrbitSpeedOnR(inf.semiMajorAxis, aphelion, inf.ref)
    const angleOnXY = rand(0, PI * 2)
    velocity.addXYZ(speedOnAphe * cos(angleOnXY + PI / 2), speedOnAphe * sin(angleOnXY + PI / 2), 0)
    const xy = aphelion * cos(inf.inclination)
    coord.addXYZ(xy * cos(angleOnXY), xy * sin(angleOnXY), aphelion * sin(inf.inclination))
    body.setupSatellites()

    const orbitalPeriod = computesOrbitalPeriod(inf.semiMajorAxis, inf.ref)
    const secBodyTakes = orbitalPeriod / DAYS_PER_SECOND
    ether.ctx.fillStyle = color
    ether.writeLine(`${name} Orbital period ≈ ${duration(secBodyTakes)}. It's ${orbitalPeriod.toFixed(2)} days, actually.`)
  }

  const run = () => {
    if (inf.stick) {
      // The Sun for an example.
      project()
      fill()
      return
    }
    loop()
  }

  return {
    body,
    ctx,
    run,
    prepare
  }
}
