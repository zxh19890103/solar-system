import { BodyInfo, Sun } from "./body-info"
import { Body } from "./body.class"
import { range } from "./utils"

const GRAVITY_CONST = 6.67430 * 0.00001 // x 10 ^ -5
const UNIT_OF_TIME = 1
const RENDER_PERIOD = 1
const SECONDS_IN_A_DAY = 24 * 60 * 60
const DAYS_PER_SECOND = RENDER_PERIOD * UNIT_OF_TIME / (60 * 24)

const { mat4, vec3 } = glMatrix
const { cos, sin, PI, sqrt } = Math

// x10 ^ 6 passed.
// console.log(1000000 * GRAVITY_CONST * Earth.mass / (Earth.radius * Earth.radius))

export class Ether {
  bodies: Body[] = []
  $textPanel: HTMLUListElement = null

  constructor() {
    const styleNode = document.createElement("style")
    styleNode.innerHTML = `
    .ether-text-panel {
      padding: 0;
      margin: 0;
      position: fixed;
      top: 0;
      left: 0;
      color: white;
      display: block;
      font-size: 14px;
      font-family: Papyrus;
    }
    `
    document.head.appendChild(styleNode)

    this.$textPanel = document.createElement("ul")
    this.$textPanel.className = "ether-text-panel"
    document.body.appendChild(this.$textPanel)

    this.writeLine(`<h3>Welcome to the real solar!</h3>`)
    this.writeLine(`Here 1 second = ${DAYS_PER_SECOND.toFixed(2)} days.`)
  }

  put(b: Body) {
    const inf = b.inf
    const angleOnXY = range(0, PI * 2)

    if (b.coordinates === undefined) {
      const xy = inf.aphelion * cos(inf.inclination)
      b.coordinates = [
        xy * cos(angleOnXY),
        xy * sin(angleOnXY),
        inf.aphelion * sin(inf.inclination)
      ]
    }

    if (b.velocity === undefined) {
      const speed = this.computesOrbitSpeedOnR(
        b.inf.semiMajorAxis,
        b.inf.aphelion
      )
      b.velocity = [
        speed * cos(angleOnXY + PI / 2),
        speed * sin(angleOnXY + PI / 2),
        0
      ]
    }

    vec3.transformMat4(
      b.coordinates,
      b.coordinates,
      b.modelMat
    )
    this.bodies.push(b)

    const orbitalPeriod = this.computesOrbitalPeriod(inf.semiMajorAxis)
    const secBodyTakes = orbitalPeriod / DAYS_PER_SECOND

    const rgba = [].map.call(b.inf.color, c => 0 ^ c * 255)
    this.writeLine(`<span style="color: rgba(${rgba.join(',')})">${inf.name}</span> takes ${this.duration(secBodyTakes)}. Actual orbital period is ${orbitalPeriod.toFixed(2)} days`)
  }

  computesFieldIntensityFromBody(target: Body, from: Body) {
    const r = vec3.distance(
      target.coordinates,
      from.coordinates
    )
    const g = (GRAVITY_CONST * from.inf.mass) / (r * r)
    const vec = vec3.create()
    vec3.subtract(
      vec,
      from.coordinates,
      target.coordinates
    )
    vec3.normalize(vec, vec)
    const fi = vec3.scale(vec, vec, g)
    return fi
  }

  computesFieldIntensity(target: Body) {
    const fi = vec3.create()
    for (const from of this.bodies) {
      if (from === target) continue
      vec3.add(
        fi,
        fi,
        this.computesFieldIntensityFromBody(target, from)
      )
    }
    return fi
  }

  move(b: Body) {
    let n = RENDER_PERIOD
    while (n--) {
      this._move(b)
    }
    mat4.translate(
      b.modelMat,
      mat4.create(),
      b.coordinates
    )
  }

  private _move(b: Body) {
    const ds = vec3.scale(
      [0, 0, 0],
      b.velocity,
      UNIT_OF_TIME
    )

    const fi = this.computesFieldIntensity(b)

    const dv = vec3.scale(
      [0, 0, 0],
      fi,
      UNIT_OF_TIME
    )
    // velocity changes
    vec3.add(
      b.velocity,
      b.velocity,
      dv
    )

    const ds1 = vec3.scale(
      [0, 0, 0],
      dv,
      .5 * UNIT_OF_TIME
    )

    vec3.add(
      ds,
      ds,
      ds1
    )

    vec3.add(
      b.coordinates,
      b.coordinates,
      ds
    )
  }

  computesOrbitSpeedOnR(sma: number, r: number, ref?: BodyInfo) {
    if (sma === 0) return 0
    const m = ref ? ref.mass : Sun.mass
    return Math.sqrt(GRAVITY_CONST * m * (2 / r - 1 / sma))
  }

  /**
   * returns days.
   */
  computesOrbitalPeriod(sma: number, ref?: BodyInfo) {
    const a = sma // * pow(10, 6)
    const g = GRAVITY_CONST //  * pow(10, -12)
    const m = (ref ? ref.mass : Sun.mass) // * pow(10, 24)
    return PI * 2 * sqrt(a * a * a / (g * m)) / SECONDS_IN_A_DAY
  }

  duration(seconds: number) {
    if (seconds < 1) return seconds.toFixed(2) + 'sec'
    const overs = [60, 60, 24, 1]
    const units = ['sec', 'min', 'hr', 'dy']
    let rem = 0 ^ seconds
    let m = 0
    let exp = ""
    while (m = overs.shift()) {
      exp = `${rem % m}${units.shift()}${exp}`
      rem = 0 ^ (rem / m)
      if (rem === 0) break
    }
    return exp
  }

  writeLine(text: string) {
    const li = document.createElement("li")
    li.innerHTML = text
    this.$textPanel.appendChild(li)
  }
}