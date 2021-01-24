import { Matrix } from "./canvas-uni-matrix";
import { Vector } from "./canvas-uni-vector";

const { PI, cos, sin } = Math

export class CameraSys {
  private coord: Vector = new Vector().xyz(0, 0, 0)
  /**
   * focal length, unit: x10^3 km
   */
  private fl = 1000
  private rotation: Matrix[] = []

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
     * 1. rotates about to X axis by angle([x, y, z], [x, 0, z])
     * 2. rotates about to Y axis by angle([x, 0, z], [0, 0, z])
     */
    const v = z ? z.times(-1) : this.coord.clone().times(-1)
    const zAxis = new Vector(0, 0, 1)
    const vOnY = new Vector(v.x, 0, v.z)
    const xAxis = new Vector(1, 0, 0)
    const yAxis = new Vector(0, 1, 0)
    if (v.x === 0 && v.z === 0) {
      // it means yAxis -> zAxis
      this.rotatesX(PI * 1.5)
    } else {
      // TODO: ?????
      const angle1 = v.angleTo(vOnY, xAxis)
      const angle2 = vOnY.angleTo(zAxis, yAxis)
      console.log(angle1, angle2 / PI)
      // this.rotatesX(angle1)
      this.rotatesY(angle2)
    }
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

  rotateXYZ(r, b, a) {
    this.rotation.push(new Matrix(`
    ${cos(a) * cos(b)} ${cos(a) * sin(b) * sin(r) - sin(a) * cos(r)} ${cos(a) * sin(b) * cos(r) + sin(a) * sin(r)} 
    ${sin(a) * cos(b)} ${sin(a) * sin(b) * sin(r) + cos(a) * cos(r)} ${sin(a) * sin(b) * cos(r) - cos(a) * sin(r)} 
    ${-sin(b)} ${cos(b) * sin(r)} ${cos(b) * cos(r)}
    `))
  }

  rotatesX(angle: number) {
    const cosine = cos(angle)
    const sine = sin(angle)
    this.rotation.push(new Matrix(
      `
      1 0 0
      0 ${cosine} ${- sine}
      0 ${sine} ${cosine}
      `
    ))
    return this
  }

  rotatesY(angle: number) {
    const cosine = cos(angle)
    const sine = sin(angle)
    this.rotation.push(new Matrix(
      `
      ${cosine} 0 ${sine}
      0 1 0
      ${- sine} 0 ${cosine}
      `
    ))
    return this
  }

  rotatesZ(angle: number) {
    const cosine = cos(angle)
    const sine = sin(angle)
    this.rotation.push(new Matrix(
      `
      ${cosine} ${- sine} 0
      ${sine} ${cosine} 0
      0 0 1
      `
    ))
    return this
  }

  transform(...xyz: number[]) {
    const origin = this.coord.toPoint()
    const [x, y, z] = xyz.map((n, i) => n - origin[i])
    const [x1, y1, z1] = this.rotation.reduce((p, matrix) => {
      return matrix.multipWithVector(...p)
    }, [x, y, z])
    return [
      x1,
      y1,
      z1
    ]
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
      isBehind ? null : ratio * Xt,
      isBehind ? null : ratio * Yt,
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
    this.rotation.forEach(m => m.print())
  }
}
