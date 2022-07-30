import { BoxGeometry, Mesh, MeshPhongMaterial } from "three"

export class Robot extends Mesh {
  constructor() {
    super(
      new BoxGeometry(580, 800, 4000),
      new MeshPhongMaterial({ color: 0x00ff11 })
    )
  }
}
