import * as GLMatrix from "gl-matrix"

declare global {
  namespace universe {
    type Point = [number, number, number]
  }
  var glMatrix: typeof GLMatrix
  var m4: typeof GLMatrix.mat4
  var v3: typeof GLMatrix.vec3

  type mat4 = GLMatrix.mat4
  type vec3 = GLMatrix.vec3
  type vec4 = GLMatrix.vec4
  type ReadonlyVec3 = GLMatrix.ReadonlyVec3
  type ReadonlyMat4 = GLMatrix.ReadonlyMat4
  type voidFn = () => void

  var WORKER_SCRIPT_URL: string
  var GLMATRIX_SCRIPT_URL: string

  function postMessage(message: any): void
  function importScripts(...urls: string[]): void
}