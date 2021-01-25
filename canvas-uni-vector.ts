import { computeAngleBy2Points } from "./canvas-uni-utils"
const { PI, sqrt, cos, sin, acos } = Math

export class Vector {
  x: number = 0
  y: number = 0
  z: number = 0

  constructor(x?: number, y?: number, z?: number) {
    x !== undefined && (this.x = x)
    y !== undefined && (this.y = y)
    z !== undefined && (this.z = z)
  }

  xyz(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
    return this
  }

  withMag(mag: number) {
    return this.normalize().times(mag)
  }

  /**
   * let mag = 1
   */
  normalize() {
    const d = this.distanceFrom()
    const k = 1 / d
    this.x *= k
    this.y *= k
    this.z *= k
    return this
  }

  extends(mag: number) {
    const d = this.distanceFrom()
    this.withMag(d + mag)
    return this
  }

  /**
   * the same one
   */
  add(v: Vector) {
    this.x += v.x
    this.y += v.y
    this.z += v.z
    return this
  }

  addXYZ(x: number, y: number, z: number) {
    this.x += x
    this.y += y
    this.z += z
    return this
  }

  /**
   * @param v 
   * @param Vn the thumb's direction while you use right-hand-rule
   */
  angleTo(v: Vector, Vn: Vector) {
    const Vc = this.cross(v)
    const dVnVc = Vc.dot(Vn)
    const ra = this.dot(v) / (this.mag() * v.mag())
    const ang = ra > 1 ? 0 : acos(ra)
    if (dVnVc < 0) {
      return PI * 2 - ang
    }
    return ang
  }

  dot(v: Vector) {
    const { x, y, z } = this
    const { x: x1, y: y1, z: z1 } = v
    return x * x1 + y * y1 + z * z1
  }

  cross(v: Vector) {
    const { x, y, z } = this
    const { x: x1, y: y1, z: z1 } = v
    return new Vector(
      y * z1 - z * y1,
      z * x1 - x * z1,
      x * y1 - y * x1
    )
  }

  mag() {
    const { x, y, z } = this
    return sqrt(x * x + y * y + z * z)
  }

  /**
   * A new one
   */
  cloneAndTimes(value: number) {
    const v = this.clone()
    v.times(value)
    return v
  }

  /**
   * the same one
   */
  times(factor: number) {
    this.x *= factor
    this.y *= factor
    this.z *= factor
    return this
  }

  distanceFrom(v?: Vector) {
    let { x, y, z } = this
    if (v) {
      x -= v.x
      y -= v.y
      z -= v.z
    }
    return sqrt(x * x + y * y + z * z)
  }

  /**
   * the same one
   */
  substract(v: Vector) {
    this.x -= v.x
    this.y -= v.y
    this.z -= v.z
    return this
  }

  /**
   * @returns {universe.Point}
   */
  toPoint() {
    return [this.x, this.y, this.z]
  }

  clone(): Vector {
    const v = {
      x: this.x,
      y: this.y,
      z: this.z
    }
    v["__proto__"] = this.constructor.prototype
    return v as Vector
  }

  toString() {
    return `-> (${this.x}, ${this.y}, ${this.z})`
  }
}
