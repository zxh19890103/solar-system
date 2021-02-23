import { Body } from "./body.class"

const { vec3 } = glMatrix

export class Camera {

  viewMat: mat4
  viewMat_t: mat4
  projectionMat: mat4

  coord: vec3
  private lookTo: vec3 = [0, 0, 0]
  private upTo: vec3 = [0, 1, 0]

  get far() {
    return vec3.distance(
      this.lookTo,
      this.coord
    )
  }

  get z() {
    return vec3.sub(
      [0, 0, 0],
      this.lookTo,
      this.coord
    )
  }

  readonly aspectRatio: number

  constructor(aspectRatio: number) {
    this.viewMat = glMatrix.mat4.create()
    this.projectionMat = glMatrix.mat4.create()
    this.viewMat_t = glMatrix.mat4.create()
    this.aspectRatio = aspectRatio
  }

  put(coord: ReadonlyVec3) {
    this.coord = glMatrix.vec3.clone(coord)
    return this
  }

  up(up: ReadonlyVec3) {
    this.upTo = glMatrix.vec3.clone(up)
    return this
  }

  see(to: vec3 | Body) {
    if (!this.coord) throw new Error("pls put the cam firstly.")
    this.lookTo = to instanceof Body ? glMatrix.vec3.clone(to.coordinates) : glMatrix.vec3.clone(to)
    this.setViewMat()
    return this
  }

  rotateAboutZ(rad: number) {
    glMatrix.mat4.rotate(
      this.viewMat,
      this.viewMat,
      rad,
      this.z
    )
    glMatrix.mat4.invert(
      this.viewMat_t,
      this.viewMat
    )
    return this
  }

  private setViewMat() {
    glMatrix.mat4.lookAt(
      this.viewMat,
      this.coord,
      this.lookTo,
      this.upTo)

    glMatrix.mat4.invert(
      this.viewMat_t,
      this.viewMat
    )
  }

  perspective(fovy: number, near: number, far: number) {
    glMatrix.mat4.perspective(
      this.projectionMat,
      fovy,
      this.aspectRatio,
      near,
      far
    )
    return this
  }

  /**
   * @param v V is the coordinates in camera space
   */
  offset(v: vec3) {
    const wc = this.toWorldSpace(v, true)
    vec3.add(this.lookTo, this.lookTo, wc)
    this.see(this.lookTo)
    return this
  }

  /**
   * transforms a coordinates of world into camera space.
   */
  toCamSpace(coord: vec3) {
    return glMatrix.vec3.transformMat4(
      [0, 0, 0],
      coord,
      this.viewMat
    )
  }

  toWorldSpace(coord: vec3, justRotation = false) {
    const v = glMatrix.vec3.transformMat4(
      [0, 0, 0],
      coord,
      this.viewMat_t
    )
    if (justRotation) {
      glMatrix.vec3.sub(
        v,
        v,
        this.coord
      )
    }
    return v
  }
}