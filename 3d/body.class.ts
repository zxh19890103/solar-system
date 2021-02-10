import { BodyInfo } from "./body-info"
import { RADIUS_K } from "./constants"

const { PI, cos, sin } = Math
const HALF_PI = PI / 2
const DOUBLE_PI = 2 * PI

const {
  vec3,
  mat4
} = glMatrix

export enum BodyLooksLike {
  Point = 10,
  Circle = 20,
  Ball = 30,
  Body = 40
}

export class Body {
  coordinates: vec3 = [0, 0, 0]
  velocity: vec3 = [0, 0, 0]
  vertices: number[]
  normals: number[]
  texCoords: number[]
  indices: number[]

  readonly localMat: mat4
  readonly modelMat: mat4

  /**
   * M is the latitudes' count, it's Y
   */
  readonly M: number
  /**
   * N is the longitudes' count. it's X
   */
  readonly N: number

  readonly inf: BodyInfo

  blk: BodyLooksLike = BodyLooksLike.Body

  constructor(inf: BodyInfo, at?: vec3, velocity?: vec3) {
    this.M = 60
    this.N = 60
    this.inf = inf
    this.coordinates = at
    this.velocity = velocity

    this.localMat = mat4.create()
    this.modelMat = mat4.create()
  }

  rotates(rad: number) {
    mat4.rotate(
      this.localMat,
      this.localMat,
      rad,
      [0, 0, 1]
    )
  }

  private makeVertex(lat: number, lon: number, r: number): ReadonlyVec3 {
    const alpha = PI * (.5 - lat / this.M)
    const beta = DOUBLE_PI * (lon / this.N)
    return [
      r * cos(alpha) * cos(beta),
      r * cos(alpha) * sin(beta),
      r * sin(alpha)
    ]
  }

  private makeTexCoords = (lat: number, lon: number) => {
    return [
      lon / this.N,
      lat / this.M
    ]
  }

  /**
   * when it's too small
   */
  private makePoint() {
    // just one vertex
    this.vertices = [0, 0, 0]
  }

  private makeCircle() {
    // just one vertex
    const vertices = []
    const r = this.inf.radius * RADIUS_K
    for (let a = 0, end = PI * 2; a < end; a += .17) {
      vertices.push(
        r * cos(a),
        r * sin(a),
        0
      )
    }
    this.vertices = vertices
  }

  private makeBall() {
    // just one vertex
    const vertices = []
    const R = this.inf.radius * RADIUS_K
    let z = 0
    for (z = - PI / 2; z <= PI / 2; z += .1) {
      const r = R * cos(z)
      const h = R * sin(z)
      for (let a = 0, end = PI * 2; a < end; a += .1) {
        vertices.push(
          r * cos(a),
          r * sin(a),
          h
        )
      }
    }
    this.vertices = vertices
  }

  private makeBody() {
    const { M, N } = this
    const r = this.inf.radius * RADIUS_K

    const vertices: number[] = []
    const normals: number[] = []
    const texCoords: number[] = []
    const indices: number[] = []

    let lat = 0, lon = 0, index = 0
    for (; lat < M; lat += 1) {
      for (lon = 0; lon < N; lon += 1) {
        indices.push(
          index++,
          index++,
          index++,
          index - 1,
          index - 2,
          index++,
        )

        vertices.push(...this.makeVertex(lat, lon, r))
        vertices.push(...this.makeVertex(lat, lon + 1, r))
        vertices.push(...this.makeVertex(lat + 1, lon, r))
        vertices.push(...this.makeVertex(lat + 1, lon + 1, r))

        const normal = vec3.create()
        vec3.normalize(normal, this.makeVertex(lat + .5, lon + .5, r))
        normals.push(
          ...normal,
          ...normal,
          ...normal,
          ...normal
        )

        texCoords.push(
          ...this.makeTexCoords(lat, lon),
          ...this.makeTexCoords(lat, lon + 1),
          ...this.makeTexCoords(lat + 1, lon),
          ...this.makeTexCoords(lat + 1, lon + 1)
        )
      }
    }

    this.vertices = vertices
    this.normals = normals
    this.texCoords = texCoords
    this.indices = indices
  }

  make() {
    switch (this.blk) {
      case BodyLooksLike.Point: {
        this.makePoint()
        break
      }
      case BodyLooksLike.Circle: {
        this.makeCircle()
        break
      }
      case BodyLooksLike.Ball: {
        this.makeBall()
        break
      }
      case BodyLooksLike.Point:
      default: {
        this.makeBody()
        break
      }
    }
  }

}