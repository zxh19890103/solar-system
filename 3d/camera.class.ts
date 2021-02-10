import { Body } from "./body.class"

export class Camera {

  viewMat: mat4
  projectionMat: mat4

  coord: vec3
  private lookTo: vec3 = [0, 0, 0]
  private up: vec3 = [0, 1, 0]

  private aspectRatio: number

  constructor(aspectRatio: number) {
    this.viewMat = glMatrix.mat4.create()
    this.projectionMat = glMatrix.mat4.create()
    this.aspectRatio = aspectRatio
  }

  put(coord: ReadonlyVec3) {
    this.coord = glMatrix.vec3.clone(coord)
    return this
  }

  setUp(up: ReadonlyVec3) {
    this.up = glMatrix.vec3.clone(up)
    return this
  }

  lookAt(to: vec3 | Body) {
    if (!this.coord) throw new Error("pls put the cam firstly.")
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