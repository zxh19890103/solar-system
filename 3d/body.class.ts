import { BodyInfo } from "./body-info"
import { CIRCLE_RAD, RADIUS_K } from "./constants"
import { parseColor } from "./utils"

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
  colors: number[] = []
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

  center() {
    this.coordinates = [0, 0, 0]
    this.velocity = [0, 0, 0]
    return this
  }

  rotates(rad: number) {
    mat4.rotate(
      this.localMat,
      this.localMat,
      rad,
      [0, 0, 1]
    )
  }

  face(v: vec3) {
    mat4.lookAt(
      this.localMat,
      [0, 0, 0],
      v,
      [0, 1, 1]
    )
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
    const texCoords = []
    const indices = []
    const r = this.inf.radius * RADIUS_K

    const makeVertex = (a: number) => {
      return [
        r * cos(a),
        r * sin(a),
        0,
      ]
    }

    const makeTexCoord = (a: number) => {
      return [
        .5 * cos(a) + .5,
        .5 * sin(a) + .5
      ]
    }

    // the origin point.
    vertices.push(0, 0, 0)
    texCoords.push(.5, .5)
    let index = 1
    let a = 0, end = PI * 2
    for (; a <= end; a += 1) {
      indices.push(
        0,
        index,
        ++index
      )
      vertices.push(...makeVertex(a))
      texCoords.push(...makeTexCoord(a))
    }
    // the last one to loop.
    vertices.push(...makeVertex(a))
    texCoords.push(...makeTexCoord(a))

    this.vertices = vertices
    this.texCoords = texCoords
    this.indices = indices
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

    const makeVertex = (lat: number, lon: number): vec3 => {
      const alpha = PI * (.5 - lat / this.M)
      const beta = DOUBLE_PI * (lon / this.N)
      return [
        r * cos(alpha) * cos(beta),
        r * cos(alpha) * sin(beta),
        r * sin(alpha)
      ]
    }

    const makeTexCoords = (lat: number, lon: number) => {
      return [
        lon / this.N,
        lat / this.M
      ]
    }

    const vertices: number[] = []
    const normals: number[] = []
    const texCoords: number[] = []
    const indices: number[] = []
    const colors: number[] = []

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

        vertices.push(...makeVertex(lat, lon))
        vertices.push(...makeVertex(lat, lon + 1))
        vertices.push(...makeVertex(lat + 1, lon))
        vertices.push(...makeVertex(lat + 1, lon + 1))

        const normal = vec3.create()
        vec3.normalize(normal, makeVertex(lat + .5, lon + .5))
        normals.push(
          ...normal,
          ...normal,
          ...normal,
          ...normal
        )

        const color = [0, 0, 0, 0]
        colors.push(...color, ...color, ...color, ...color)

        texCoords.push(
          ...makeTexCoords(lat, lon),
          ...makeTexCoords(lat, lon + 1),
          ...makeTexCoords(lat + 1, lon),
          ...makeTexCoords(lat + 1, lon + 1)
        )
      }
    }

    this.vertices = vertices
    this.normals = normals
    this.texCoords = texCoords
    this.indices = indices
    this.colors = colors

    if (this.hasRings) this.makeRings()
  }

  withRings() {
    this.hasRings = true
    return this
  }

  hasRings = false
  ringsVertexIndexOffset = 0
  makeRings() {
    const {
      vertices,
      texCoords,
      colors,
      normals,
      indices,
      inf,
    } = this

    let index = vertices.length / 3
    // ring
    this.ringsVertexIndexOffset = indices.length
    // for saturn
    let ringR = (inf.radius * 1.2) * RADIUS_K
    const D_R = 10
    const MAX = 0 ^ (inf.radius * 1.3) * RADIUS_K / D_R
    let n = 0

    const bodyColor = inf.color

    const ringColors = [
      [44, 34, 28, 0],// 0
      [66, 53, 41, .15], // 1
      [104, 88, 71, .2], // 2
      [227, 198, 144, .36], // 3
      [83, 71, 57, .7], // 4
      [136, 118, 86, 1], // 5
    ].map(rgb => {
      const color = glMatrix.vec3.mul(
        [0, 0, 0],
        [rgb[0], rgb[1], rgb[2]],
        [bodyColor[0], bodyColor[1], bodyColor[2]]
      )
      // glMatrix.vec3.scale(color, color, 1 / 255)
      return [color[0], color[1], color[2], rgb[3]]
    })

    const getRingColor = (n) => {
      const range = n / MAX
      const index = ringColors.findIndex(x => {
        return x[3] > range
      })
      const start = ringColors[index - 1]
      const end = ringColors[index]

      const rgba = [0, 0, 0, 1 - range * .04]
      const span = end[3] - start[3]
      const ratio = (range - start[3]) / span
      Array(3).fill(0).forEach((c, ix) => {
        rgba[ix] = (start[ix] + (end[ix] - start[ix]) * ratio) / 255
      })
      return rgba
    }

    const makeVertex = (a: number, r: number) => {
      return [r * cos(a), r * sin(a), 0]
    }

    while (n < MAX) {
      const color = getRingColor(n)
      for (let a = 0; a < CIRCLE_RAD; a += .1) {
        indices.push(
          index, index + 2, index + 1,
          index, index + 2, index + 3
        )
        index += 4
        vertices.push(
          ...makeVertex(a, ringR), // index
          ...makeVertex(a + .2, ringR), // index + 1
          ...makeVertex(a + .2, ringR + 10), // index + 2
          ...makeVertex(a, ringR + 10) // index + 3
        )
        normals.push(
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1
        )
        texCoords.push(
          2, 2,
          2, 2,
          2, 2,
          2, 2)
        colors.push(...color, ...color, ...color, ...color)
      }
      ringR += D_R
      n += 1
    }
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