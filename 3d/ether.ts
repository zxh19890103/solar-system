import { BodyInfo, Sun } from "./body-info"
import { Body } from "./body.class"
import { range } from "./utils"

const GRAVITY_CONST = 6.67430 * 0.00001
const UNIT_OF_TIME = 7000
const RENDER_PERIOD = 100

const { mat4, vec3 } = glMatrix
const { cos, sin, PI } = Math

export class Ether {
  bodies: Body[] = []

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
  }

  computesFieldIntensityFromBody(target: Body, from: Body) {
    const r = vec3.distance(
      target.coordinates,
      from.coordinates
    )
    const mag = (GRAVITY_CONST * from.inf.mass) / (r * r)
    const vec = vec3.create()
    vec3.subtract(
      vec,
      from.coordinates,
      target.coordinates
    )
    vec3.normalize(vec, vec)
    const fi = vec3.scale(vec, vec, mag)
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
}