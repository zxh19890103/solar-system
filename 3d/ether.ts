import { Body } from "./body.class"

const GRAVITY_CONST = 6.67430 * 0.00001
const UNIT_OF_TIME = 1
const RENDER_PERIOD = 1000

const { mat4, vec3 } = glMatrix

export class Ether {
  bodies: Body[] = []

  put(b: Body) {
    b.modelMat
    vec3.transformMat4(
      b.center,
      b.center,
      b.modelMat
    )
    this.bodies.push(b)
  }

  computesFieldIntensityFromBody(target: Body, from: Body) {
    const r = vec3.distance(
      target.center,
      from.center
    )
    const mag = (GRAVITY_CONST * from.inf.mass) / (r * r)
    const vec = vec3.create()
    vec3.subtract(
      vec,
      from.center,
      target.center
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

  moveBody(b: Body) {
    let n = RENDER_PERIOD
    while (n--) {
      this._moveBody(b)
    }
    mat4.translate(
      b.modelMat,
      mat4.create(),
      b.center
    )
  }

  private _moveBody(b: Body) {
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
      b.center,
      b.center,
      ds
    )
  }
}