import { randColor } from "./utils"

const { cos, sin } = Math
const {
  vec3
} = glMatrix

export abstract class Thing {
  readonly vertices: number[]
  readonly colors: number[]
  readonly normals: number[]
  readonly indices: number[]

  protected offset: number = 0
  protected indexOffset: number = 0
  protected selfVerticesCount = 0
  protected selfIndicesCount = 0
  protected readonly things: Thing[]

  protected color: vec4 = [1, 1, 1, 1]

  abstract make(): void
  abstract render(gl: WebGLRenderingContext): () => void

  constructor() {
    this.vertices = []
    this.colors = []
    this.normals = []
    this.indices = []
    this.things = []
  }

  get VertexCount() {
    return this.vertices.length / 3
  }

  get IndexCount() {
    return this.indices.length
  }

  set Offset(value: number) {
    this.offset = value
  }

  set IndexOffset(value: number) {
    this.indexOffset = value
  }

  setVertex(index: number, value: vec3) {
    this.vertices[index * 3] = value[0]
    this.vertices[index * 3 + 1] = value[1]
    this.vertices[index * 3 + 2] = value[2]
  }

  getVertex(index: number): vec3 {
    return this.vertices.slice(
      index * 3, index * 3 + 3
    ) as vec3
  }

  getVertices(...indices: number[]): vec3[] {
    return indices.map(
      i => this.getVertex(i)
    )
  }

  /**
   * with color
   * you can push multiple.
   */
  pushVertex(...xyz: number[]) {
    const count = xyz.length / 3
    this.vertices.push(...xyz)
    this.colors.push(...Array(count).fill(this.color).flat())
  }

  pushPolarVertexOnXY(...rd: number[]) {
    let i = 0
    while (rd[i] !== undefined) {
      this.pushVertex(
        rd[i] * cos(rd[i + 1]),
        rd[i] * sin(rd[i + 1]),
        0
      )
      i += 2
    }
  }

  pushPolarVertex(r: number, rad: number, z: number) {
    this.pushVertex(
      r * cos(rad),
      r * sin(rad),
      z
    )
  }

  acceptTransformation(mat: mat4) {
    let index = 0
    for (const vertex of this.everyVertex()) {
      const newVertex = glMatrix.vec3.transformMat4(
        [0, 0, 0],
        vertex,
        mat
      )
      this.setVertex(index, newVertex)
      index += 1
    }
  }

  rotate(rad: number, axis: vec3) {
    const mat = glMatrix.mat4.create()
    glMatrix.mat4.rotate(
      mat,
      mat,
      rad,
      axis
    )
    this.acceptTransformation(mat)
  }

  translatate(coord: vec3) {
    const mat = glMatrix.mat4.create()
    glMatrix.mat4.translate(
      mat,
      mat,
      coord,
    )
    this.acceptTransformation(mat)
  }

  put(coord: vec3, rad: number) {
    const mat = glMatrix.mat4.create()
    glMatrix.mat4.translate(
      mat, mat, coord
    )
    glMatrix.mat4.rotate(
      mat, mat, rad, [0, 0, 1]
    )
    this.acceptTransformation(mat)
  }

  *everyVertex() {
    let i = 0, xyz = [0, 0, 0] as vec3
    for (const num of this.vertices) {
      xyz[i] = num
      if (i === 2) yield xyz
      i = (i + 1) % 3
    }
  }

  pipeAllThings() {
    const selfVertexCount = this.VertexCount
    const selfIndexCount = this.IndexCount
    let offset = selfVertexCount
    let indexOffset = selfIndexCount
    for (const thing of this.things) {
      thing.offset = offset
      thing.indexOffset = indexOffset
      const [vertexCount, indexCount] = this._pipe(thing)
      offset += vertexCount
      indexOffset += indexCount
    }
    this.selfVerticesCount = selfVertexCount
    this.selfIndicesCount = selfIndexCount
  }

  protected mesh(o: vec3, v1: vec3, v2: vec3, n1: number, n2: number) {
    const v1o = vec3.sub([0, 0, 0], v1, o)
    const v2o = vec3.sub([0, 0, 0], v2, o)
    const norm1 = vec3.normalize([0, 0, 0], v1o)
    const norm2 = vec3.normalize([0, 0, 0], v2o)
    const len1 = vec3.len(v1o)
    const len2 = vec3.len(v2o)
    const d1 = len1 / (n1 - 1)
    const d2 = len2 / (n2 - 1)
    const vertices: vec3[] = []

    const arr1 = Array(n1 - 1).fill(0).map((x, i) => i * d1)
    arr1.push(len1)
    const arr2 = Array(n2 - 1).fill(0).map((x, i) => i * d2)
    arr2.push(len2)

    for (let i = 0; i < n1; i++) {
      for (let j = 0; j < n2; j++) {
        vertices.push(
          vec3.add(
            [0, 0, 0],
            o,
            vec3.add(
              [0, 0, 0],
              vec3.scale([0, 0, 0], norm1, arr1[i]),
              vec3.scale([0, 0, 0], norm2, arr2[j])
            )
          )
        )
      }
    }
    return vertices
  }

  private _pipe(thing: Thing) {
    this.vertices.push(
      ...thing.vertices
    )
    this.colors.push(
      ...thing.colors
    )
    this.normals.push(
      ...thing.normals
    )
    this.indices.push(
      ...thing.indices.map(i => i + thing.offset)
    )
    return [
      thing.VertexCount,
      thing.IndexCount
    ]
  }
}