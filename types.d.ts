import * as GLMatrix from "gl-matrix"

declare global {
  namespace universe {
    type Point = [number, number, number]
  }
  var glMatrix: typeof GLMatrix
}