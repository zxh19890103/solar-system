import { Matrix } from "./canvas-uni-matrix"
import { Vector } from "./canvas-uni-vector"

const { PI, cos, sin, round } = Math

export class CameraSys {
  private coord: Vector = new Vector().xyz(0, 0, 0)
  /**
   * focal length, unit: x10^3 km
   */
  private fl = 1000
  private transforms: Matrix[] = []
  private finalRot: Matrix

  constructor() {
    this.finalRot = new Matrix(`
    1 0 0
    0 1 0
    0 0 1
    `)
  }

  translates(x: number, y?: number, z?: number) {
    this.coord.x += x
    y !== undefined && (this.coord.y += y)
    z !== undefined && (this.coord.z += z)
    return this
  }

  translatesX(value: number) {
    this.coord.x += value
    return this
  }

  translatesY(value: number) {
    this.coord.y += value
    return this
  }

  translatesZ(value: number) {
    this.coord.z += value
    return this
  }

  /**
   * bigger focal length is, the bigger images would be dislayed.
   * @param val unit: 10^3 km
   */
  setFocalLength(val: number) {
    this.fl = val
  }

  /**
   * set camera-coord sys's z-axis
   */
  setZAxis(z?: Vector) {
    // coord -> [0,0,0]
    /**
     * let vector (0, 0, 0) -> (x, y, z) to be the new Z axis.
     * steps: 
     * 1. rotates about to X axis by angle([0, y, z], [0, 0, 1])
     * 2. rotates about to Y axis by angle([x, 0, -y], [0, 0, 1])
     */
    const newZAxis = z ? z.scale(-1) : this.coord.clone().scale(-1)
    const zAxis = new Vector(0, 0, 1)
    const xAxis = new Vector(1, 0, 0)
    const yAxis = new Vector(0, 1, 0)
    const v1 = new Vector(0, newZAxis.y, newZAxis.z)

    if (newZAxis.y === 0 && newZAxis.z === 0) {
      const ang = newZAxis.angleTo(zAxis, yAxis)
      this.rotatesY(ang)
      return
    }

    if (newZAxis.y === 0 && newZAxis.x === 0) {
      const ang = newZAxis.angleTo(zAxis, yAxis)
      this.rotatesY(ang)
      return
    }

    const angle1 = v1.angleTo(zAxis, xAxis)
    const v2 = new Vector(newZAxis.x, 0, Math.sqrt(newZAxis.y * newZAxis.y + newZAxis.z * newZAxis.z))
    const angle2 = v2.angleTo(zAxis, yAxis)
    this.rotatesX(angle1)
    this.rotatesY(angle2)
  }

  rotates(angleX: number, angleY?: number, angleZ?: number) {
    this.rotatesX(angleX)
    angleY !== undefined && (
      this.rotatesY(angleY)
    )
    angleZ !== undefined && (
      this.rotatesZ(angleZ)
    )
    return this
  }

  rotatesX(angle: number) {
    const cosine = cos(angle)
    const sine = sin(angle)
    const matrix = new Matrix(
      `
      1 0 0
      0 ${cosine} ${- sine}
      0 ${sine} ${cosine}
      `
    )
    this.transforms.push(matrix)
    this.finalRot = matrix.multipleBy(this.finalRot)
    return this
  }

  rotatesY(angle: number) {
    const cosine = cos(angle)
    const sine = sin(angle)
    const matrix = new Matrix(
      `
      ${cosine} 0 ${sine}
      0 1 0
      ${- sine} 0 ${cosine}
      `
    )
    this.transforms.push(matrix)
    this.finalRot = matrix.multipleBy(this.finalRot)
    return this
  }

  rotatesZ(angle: number) {
    const cosine = cos(angle)
    const sine = sin(angle)
    const matrix = new Matrix(
      `
      ${cosine} ${- sine} 0
      ${sine} ${cosine} 0
      0 0 1
      `
    )
    this.transforms.push(matrix)
    this.finalRot = matrix.multipleBy(this.finalRot)
    return this
  }

  transform(...xyz: number[]) {
    const origin = this.coord.toPoint()
    const Pt = xyz.map((n, i) => n - origin[i])
    return this.transforms.reduce((point, matrix) => {
      return matrix.multipleWithXyz(...point)
    }, Pt)
  }

  project(...xyz: number[]) {
    const [X, Y, Z] = xyz
    const point3d = this.transform(X, Y, Z)
    const [Xt, Yt, Zt] = point3d
    // you can't see it while it's behind your camera.
    const isBehind = Zt < this.fl
    // unit: pixels / (10^3 km)
    const ratio = this.fl / Zt
    return [
      isBehind ? null : round(ratio * Xt),
      isBehind ? null : round(ratio * Yt),
      ratio,
      Zt
    ]
  }

  /**
   * returns unit: x10^3 km / pixel
   * @param z unit: x10^3 km
   */
  computesResolutionOnZ(z?: number) {
    return (z || this.coord.mag()) / this.fl
  }

  computesDistanceFromOrigin() {
    return this.coord.mag()
  }

  toString() {
    this.transforms.forEach(m => m.print())
  }
}
