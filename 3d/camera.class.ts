export class Camera {

  viewMat: mat4
  projectionMat: mat4

  private aspectRatio: number

  constructor(aspectRatio: number) {
    this.viewMat = glMatrix.mat4.create()
    this.projectionMat = glMatrix.mat4.create()
    this.aspectRatio = aspectRatio
  }

  put(coord: ReadonlyVec3, up: ReadonlyVec3) {
    glMatrix.mat4.lookAt(
      this.viewMat,
      coord,
      [0, 0, 0],
      up)
    return this
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