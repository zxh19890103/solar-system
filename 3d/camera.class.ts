import { Body } from "./body.class"

const { vec3 } = glMatrix

export class Camera {

  viewMat: mat4
  projectionMat: mat4

  coord: vec3
  private _towards: vec3 = null
  get towards(): vec3 {
    if (this._towards === null) {
      this._towards = vec3.normalize(
        [0, 0, 0],
        vec3.sub(
          [0, 0, 0],
          this.lookTo,
          this.coord
        )
      )
    }
    return this._towards
  }
  private lookTo: vec3 = [0, 0, 0]
  private upTo: vec3 = [0, 1, 0]

  get far() {
    return vec3.distance(
      this.lookTo,
      this.coord
    )
  }

  private aspectRatio: number

  constructor(aspectRatio: number) {
    this.viewMat = glMatrix.mat4.create()
    this.projectionMat = glMatrix.mat4.create()
    this.aspectRatio = aspectRatio
  }

  put(coord: ReadonlyVec3) {
    this.coord = glMatrix.vec3.clone(coord)
    this._towards = null
    return this
  }

  up(up: ReadonlyVec3) {
    this.upTo = glMatrix.vec3.clone(up)
    return this
  }

  moveBy(change: vec3, linear = false) {
    if (!this.coord) throw new Error("pls put the cam firstly.")
    vec3.add(
      this.coord,
      this.coord,
      change
    )
    this.setViewMat()
    if (linear) return
    this._towards = null
  }

  lookAt(to: vec3 | Body) {
    if (!this.coord) throw new Error("pls put the cam firstly.")
    this.lookTo = to instanceof Body ? to.coordinates : to
    this._towards = null
    this.setViewMat()
    return this
  }

  private setViewMat() {
    // glMatrix.mat4.translate(
    //   this.viewMat,
    //   this.viewMat,
    //   this.coord
    // )
    glMatrix.mat4.lookAt(
      this.viewMat,
      this.coord,
      this.lookTo,
      this.upTo)
  }

  rotate(rad: number) {
    glMatrix.mat4.rotateZ(
      this.viewMat,
      this.viewMat,
      rad
    )
  }

  adjust(fovy: number, near: number, far: number) {
    glMatrix.mat4.perspective(
      this.projectionMat,
      fovy,
      this.aspectRatio,
      near,
      far
    )
    return this
  }

}