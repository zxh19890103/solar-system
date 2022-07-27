import {
  BoxBufferGeometry,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshPhongMaterial,
} from "three"

const material = new MeshPhongMaterial({
  color: 0xffffff,
  opacity: 0.5,
  transparent: true,
})

export class Shelf extends Mesh {
  // private angle: number = 0
  constructor(l: number, w: number, h: number) {
    const geometry = new BoxBufferGeometry(l, w, h)
    super(geometry, material)
  }
}

class ShelfGeometry extends BufferGeometry {
  constructor(l: number, w: number, h: number) {
    super()
    const vertices = new Float32Array([
      -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0,
    ].map(x => x * 1000))

    this.attributes['position'] = new BufferAttribute(vertices, 3);
  }
}
