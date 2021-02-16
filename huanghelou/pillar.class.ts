import { Thing } from "../common/thing.class"
import { randColor } from "../common/utils"

const { PI, sin, cos } = Math

export class PillarThing extends Thing {

  readonly r: number
  readonly length: number

  constructor(r: number, length: number) {
    super()
    this.r = r
    this.length = length
  }

  protected make() {
    this.indices = []
    let index = 0
    for (let a = 0; a < PI * 2; a += .2) {
      let z = this.length
      while ((z -= .5) > 0) {
        this.vertices.push(
          this.r * cos(a),
          this.r * sin(a),
          z
        )
        this.indices.push(index++)
        this.colors.push(...randColor())
      }
    }
  }
}