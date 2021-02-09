import { Body } from "./body.class"

export class Camera {

  viewMat: mat4
  projectionMat: mat4

  private coord: ReadonlyVec3
  private lookTo: ReadonlyVec3 = [0, 0, 0]
  private up: ReadonlyVec3 = [1, 1, 1]

  private aspectRatio: number

  constructor(aspectRatio: number) {
    this.viewMat = glMatrix.mat4.create()
    this.projectionMat = glMatrix.mat4.create()
    this.aspectRatio = aspectRatio
  }

  put(coord: ReadonlyVec3) {
    this.coord = coord
    glMatrix.mat4.lookAt(
      this.viewMat,
      this.coord,
      this.lookTo,
      this.up)
    return this
  }

  lookAt(to: vec3 | Body) {
    this.lookTo = to instanceof Body ? to.coordinates : to
    glMatrix.mat4.lookAt(
      this.viewMat,
      this.coord,
      this.lookTo,
      this.up)
    return this
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