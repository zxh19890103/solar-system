import { Mesh, MeshPhongMaterial, PlaneGeometry } from "three"

export class Ground extends Mesh {
  constructor() {
    super(
      new PlaneGeometry(100000, 100000),
      new MeshPhongMaterial({ color: 0x897654 })
    )

    this.position.set(45000, 45000, 0)
  }
}
