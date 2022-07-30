import { Group } from "three"
import { Shelf } from "./Shelf.class"
import { Ground } from "./Ground.class"

interface Layout {
  /**
   * number of shelfs by main axis
   */
  m: number
  /**
   * number of shelfs by cross axis.
   */
  n: number
  /**
   * length on main axis ( = x-axis)
   */
  l: number
  /**
   * length on cross axis ( = y-axis)
   */
  w: number
  /**
   * length on z axis.
   */
  h: number
  gapX?: number
  gapY?: number
}

export class Warehouse extends Group {
  length: number = 0
  width: number = 0

  addShelf(size: THREE.Vector3Tuple, position: THREE.Vector3Tuple) {
    const shelf = new Shelf(...size)
    shelf.position.set(...position)
    this.add(shelf)
  }

  layout(args: Layout) {
    const ground = new Ground()
    ground.translateZ(-args.h / 2)
    this.add(ground)

    const { m, n, l, w, h } = args
    const gapX = args.gapX || 0
    const gapY = args.gapY || 0
    const size = [l, w, h] as THREE.Vector3Tuple

    this.length = m * l
    this.width = n * (w + gapY)

    for (let x = 0; x < m; x += 1) {
      for (let y = 0; y < n; y += 1) {
        this.addShelf(size, [(l + gapX) * x, (w + gapY) * y, 0])
      }
    }
  }
}
