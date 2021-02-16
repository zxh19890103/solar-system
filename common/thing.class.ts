export abstract class Thing {
  readonly vertices: number[]
  readonly colors: number[]
  readonly normals: number[]
  readonly indices: number[]

  protected offset: number = 0
  protected indexOffset: number = 0
  protected readonly things: Thing[]

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
    return [
      selfVertexCount,
      selfIndexCount
    ]
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