import {
  BoxBufferGeometry,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshPhongMaterial,
  InstancedMesh,
  PlaneGeometry,
} from "three"

const material = new MeshPhongMaterial({
  color: 0x223344,
  opacity: 0.8,
  transparent: true,
})

const boxg = new BoxGeometry(300, 300, 300)

const material2 = new MeshPhongMaterial({
  color: 0x22aaaa,
  opacity: 1,
  transparent: false,
})

export class Shelf2 extends Mesh {
  // private angle: number = 0

  constructor(l: number, w: number, h: number) {
    super(new BoxBufferGeometry(l, w, h), material)
  }
}

export class Shelf extends Group {
  private planes: number = 3
  private boxes: number = 5

  constructor(l: number, w: number, h: number) {
    super()

    const { PI, sin, cos } = Math
    const D2R = PI / 180

    const box = new BoxBufferGeometry(80, 80, 4000)

    let rad = 0 * D2R,
      halfL = l / 2,
      halfW = w / 2

    const n = [1, 1, 1, -1, -1, -1, -1, 1]

    for (let i = 0; i < 4; i++) {
      const pilar = new Mesh(box, material)
      pilar.position.set(halfL * n[i * 2], halfW * n[i * 2 + 1], 0)
      this.add(pilar)
    }

    for (let i = 0; i < this.planes; i++) {
      const plane = new Mesh(new PlaneGeometry(l, w), material)
      plane.translateZ(800 * i)

      const back = new Mesh(new PlaneGeometry(l, w), material)
      back.translateZ(800 * i)
      back.rotateY(180 * D2R)

      for (let i = 0; i < 3; i++) {
        const box = new Mesh(boxg, material2)
        box.position.set(i * 400, 0, 150)
        plane.add(box)
      }

      this.add(plane, back)
    }
  }
}

class ShelfGeometry extends BufferGeometry {
  constructor(l: number, w: number, h: number) {
    super()
    const vertices = new Float32Array(
      [
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
        1.0, 1.0, -1.0, -1.0, 1.0,
      ].map((x) => x * 1000)
    )

    this.attributes["position"] = new BufferAttribute(vertices, 3)
  }
}
