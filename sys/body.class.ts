import { BodyInfo } from "./body-info"
import { AU, CIRCLE_RAD, RADIUS_SCALE } from "./constants"
import { ObjectProgram } from "./program.class"
import { parseColor, randColor, range } from "./utils"

const { PI, cos, sin } = Math
const HALF_PI = PI / 2
const DOUBLE_PI = 2 * PI

const {
  vec3,
  mat4
} = glMatrix

export enum RenderBodyAs {
  Point = 10,
  Circle = 20,
  Ball = 30,
  Body = 40,
  Orbit = 50,
  Rings = 60,
  Tails = 70
}

export class Body {
  coordinates: vec3 = [0, 0, 0]
  angleOnXY: number = range(0, PI * 2)
  velocity: vec3 = [0, 0, 0]
  vertices: number[]
  normals: number[]
  texCoords: number[]
  colors: number[] = []
  indices: number[]
  orbitalCoordinates: number[]
  orbitalCoordinateCount: number = 0
  framesCountOfOrbitFin: number = 0

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

  private rotationSpeed: number = .01

  set RotationSpeed(rs: number) {
    this.rotationSpeed = rs
  }

  programs: ObjectProgram[] = []

  constructor(inf: BodyInfo, at?: vec3, velocity?: vec3) {
    this.M = 60
    this.N = 60
    this.inf = inf
    this.coordinates = at
    this.velocity = velocity

    this.localMat = mat4.create()
    this.modelMat = mat4.create()
  }

  setAngleOnXY(value: number) {
    this.angleOnXY = value
  }

  useProgram(prog: ObjectProgram) {
    prog.setBody(this)
    this.programs.push(prog)
  }

  center() {
    this.coordinates = [0, 0, 0]
    this.velocity = [0, 0, 0]
    return this
  }

  rotates(rad: number, axis: vec3) {
    mat4.rotate(
      this.localMat,
      this.localMat,
      rad,
      axis
    )
  }

  selfRotates() {
    mat4.rotate(
      this.localMat,
      this.localMat,
      this.rotationSpeed,
      [0, 0, 1]
    )
  }

  translates() {
    mat4.translate(
      this.modelMat,
      mat4.create(),
      this.coordinates
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

  addSatellite(satellite: Body) {

    glMatrix.vec3.transformMat4(
      satellite.coordinates,
      satellite.coordinates,
      this.localMat
    )
    glMatrix.vec3.transformMat4(
      satellite.coordinates,
      satellite.coordinates,
      this.modelMat
    )

    satellite.translates()

    glMatrix.vec3.transformMat4(
      satellite.velocity,
      satellite.velocity,
      this.localMat
    )

    vec3.add(
      satellite.velocity,
      satellite.velocity,
      this.velocity
    )
  }

  /**
   * when it's too small
   */
  private makePoint() {
    // just one vertex
    // more points
    this.vertices = [0, 0, 0]
  }

  private makeCircle() {
    // just one vertex
    const vertices = []
    const texCoords = []
    const indices = []
    const r = this.inf.radius * RADIUS_SCALE

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
    const vertices = []
    const colors = []
    const R = this.inf.radius * RADIUS_SCALE
    let z = 0, a = 0
    let m = 50, n = 50
    for (let y = 0; y <= m; y++) {
      z = PI / 2 - y * (PI / 50)
      const r = R * cos(z)
      const h = R * sin(z)
      const color = randColor(this.inf.color)
      for (let x = 0; x <= n; x++) {
        a = x * (CIRCLE_RAD / n)
        vertices.push(
          r * cos(a),
          r * sin(a),
          h
        )
        colors.push(
          ...color
        )
      }
    }

    const indices = []
    for (let y = 0; y < m; y++) {
      for (let x = 0; x < n; x++) {
        const i = n * y + x
        const j = n * (y + 1) + x
        indices.push(
          i, j, i + 1,
          j, i + 1, j + 1
        )
      }
    }

    this.colors = colors
    this.indices = indices
    this.vertices = vertices
  }

  private makeBody() {
    const { M, N } = this
    const r = this.inf.radius * RADIUS_SCALE

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
  }

  collectOrbitalCoords(coords: vec3) {
    if (this.orbitalCoordinateCount > this.framesCountOfOrbitFin) {
      this.orbitalCoordinates.shift()
      this.orbitalCoordinates.shift()
      this.orbitalCoordinates.shift()
    } else {
      this.orbitalCoordinateCount += 1
    }
    this.orbitalCoordinates.push(...coords)
  }

  private makeRings() {
    const vertices: number[] = []
    const colors: number[] = []
    const { radius: R, rings } = this.inf
    const r0 = R + rings[0][1] / 1000
    const r1 = R + rings[rings.length - 1][1] / 1000
    const min = rings[0][1]
    const span = rings[rings.length - 1][1] - min
    const colorbands = rings.map(([color, r]) => {
      const v4 = parseColor(color)
      v4[3] = (r - min) / span
      return v4
    })

    const getColor = () => {
      const ratio = (r - r0) / (r1 - r0)
      const colorIndex = colorbands.findIndex(x => x[3] > ratio) - 1
      const floorColor = colorbands[colorIndex]
      const ceilColor = colorbands[colorIndex + 1]
      const aspect = (ratio - floorColor[3]) / (ceilColor[3] - floorColor[3])
      const color = floorColor.map((c, ix) => {
        return c + (ceilColor[ix] - c) * aspect
      })
      color[3] = .6 + Math.random() * .4
      return color
    }

    let r = r0
    for (; r < r1; r += .1) {
      const color = getColor()
      for (let a = 0; a < CIRCLE_RAD; a += .17) {
        let n = 0 ^ Math.random() * 2
        while (n--) {
          const rr = r + Math.random() * 1.2
          const ra = a + Math.random() * .3
          const z = range(- R * .05, R * .05)
          vertices.push(
            rr * RADIUS_SCALE * cos(ra),
            rr * RADIUS_SCALE * sin(ra),
            z * RADIUS_SCALE,
            range(.5, 2)
          )
          colors.push(
            ...color
          )
        }
      }
    }
    this.vertices = vertices
    this.colors = colors
  }

  /**
   * - colors: white, blur, yellow.
   * - wider and wider.
   * - dust tail & ion tail: 
   *  - ion tail points straight away from the sun, with color blue.
   *  - dust tail curves towards the orbital path, with color yellow.
   * - the closer to the sun, the longer the tail is.
   */
  private makeTails() {
    const length = 3.8 //  * AU function of coordinates

    // image coordinates only has Z component for building model
    const vertices: number[] = []
    const colors: number[] = []

    let size = 0 // changes by the length
    // builds ion tail
    const color = [.1, .5, .8]
    const color2 = [.8, .6, .1]
    for (let z = .001; z < length; z += .001) {
      let n = 0 ^ 3 * (1 - z / length)
      const k = z * z * .07
      const h = z * AU
      while (n--) {
        const a = CIRCLE_RAD * Math.random()
        const alpha = Math.random()
        const r = size * alpha
        for (let x = 0; x < 2; x++) {
          vertices.push(
            (r * cos(a) + (x === 0 ? 0 : k)) * AU,
            (r * sin(a) + (x === 0 ? 0 : k)) * AU,
            h
          )
          colors.push(
            ...(x === 0 ? color : color2),
            (1 - alpha) * .01 / k
          )
        }
      }
      size += .00007
    }

    this.vertices = vertices
    this.colors = colors
  }

  make(renderAs: RenderBodyAs = RenderBodyAs.Point) {
    switch (renderAs) {
      case RenderBodyAs.Point: {
        this.makePoint()
        break
      }
      case RenderBodyAs.Circle: {
        this.makeCircle()
        break
      }
      case RenderBodyAs.Ball: {
        this.makeBall()
        break
      }
      case RenderBodyAs.Orbit: {
        // it's special cuz only one vertex  [0,0,0] is meaningless to show the orbit.
        this.orbitalCoordinates = []
        break
      }
      case RenderBodyAs.Rings: {
        this.makeRings()
        break
      }
      case RenderBodyAs.Tails: {
        this.makeTails()
        break
      }
      case RenderBodyAs.Body:
      default: {
        this.makeBody()
        break
      }
    }
  }

}