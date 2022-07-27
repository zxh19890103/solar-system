import { Group } from "three"
import { Shelf } from "./Shelf.class"

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
  addShelf(size: THREE.Vector3Tuple, position: THREE.Vector3Tuple) {
    const shelf = new Shelf(...size)
    shelf.position.set(...position)
    this.add(shelf)
  }

  layout(args: Layout) {
    const { m, n, l, w, h } = args
    const gapX = args.gapX || 0
    const gapY = args.gapY || 0
    const size = [l, w, h] as THREE.Vector3Tuple

    for (let x = 0; x < m; x += 1) {
      for (let y = 0; y < n; y += 1) {
        this.addShelf(size, [(l + gapX) * x, (w + gapY) * y, 0])
      }
    }
  }
}
