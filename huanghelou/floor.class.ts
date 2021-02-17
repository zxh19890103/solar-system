import { Thing } from "../common/thing.class"
import { parseColor, randColor } from "../common/utils"
import { BarThing } from "./bar.class"
import { EavesThing } from "./eaves.class"
import { GuardtailThing } from "./guardrail.class"
import { HornThing } from "./horn.class"
import { WindowThing } from "./window.class"

const { PI, sin, cos } = Math
const {
  vec3
} = glMatrix

export class FloorThing extends Thing {
  readonly r: number
  readonly angl0: number // eaves angle
  readonly angl1: number // horn angle

  private hornL: number = 1
  private hornW: number = 1
  private hornH: number = .4

  private height = 1.2

  constructor(r: number, angl0: number) {
    super()
    this.r = r
    this.angl0 = angl0
    this.angl1 = PI / 2 - angl0

    this.hornW = this.r * Math.tan(this.angl0 / 2) * .6777
  }

  private addHorn(rad, coord) {
    const horn = new HornThing(this.hornL, this.hornW, this.hornH)
    horn.make()
    const coord1 = [...coord] as vec3
    coord1[2] -= this.hornH
    horn.put(coord1, rad - PI / 2)
    this.things.push(horn)
    return horn
  }

  private addEaves(...vertices: vec3[]) {
    const eaves = new EavesThing(...vertices)
    eaves.make()
    this.things.push(eaves)
  }

  private addBar(coord: vec3, rad: number) {
    const bar = new BarThing(.1, this.height)
    bar.make()
    const coord1 = [...coord] as vec3
    coord1[2] -= this.height
    bar.put(coord1, rad - PI / 2)
    this.things.push(bar)
  }

  private addWindow() {
    const horns = this.things.filter(thing => thing instanceof HornThing) as HornThing[]
    const win = new WindowThing(.3, ...horns)
    win.make()
    this.things.push(win)
  }

  private addGuardrail(...fourVetices: vec3[]) {
    const rail = new GuardtailThing(...fourVetices)
    rail.make()
    this.things.push(rail)
  }

  make() {
    const r0 = this.r
    const r1 = r0 * cos(this.angl0 / 2)
    const r2 = r1 / cos(this.angl0 / 4)
    const r3 = r0 + .7

    let angle = 0
    const angles: number[] = []

    let i = 0

    for (; i < 4; i++) {
      const rad = i * PI / 2

      angle = rad - this.angl0 / 2
      this.pushPolarVertexOnXY(r0, angle) // 0
      angles.push(angle)

      angle = rad - this.angl0 / 4
      this.pushPolarVertexOnXY(r2, angle) // 1
      angles.push(angle)

      angle = rad
      this.pushPolarVertexOnXY(r1, rad)  // 2
      angles.push(angle)

      angle = rad + this.angl0 / 4
      this.pushPolarVertexOnXY(r2, angle) // 3
      angles.push(angle)

      angle = rad + this.angl0 / 2
      this.pushPolarVertexOnXY(r0, angle) // 4
      angles.push(angle)

      angle = rad + this.angl0 / 2 + this.angl1 / 2
      this.pushPolarVertexOnXY(r0, angle) // 5
      angles.push(angle)
    }

    console.log(this.VertexCount)
    // offset = 24
    for (i = 0; i < 4; i += 1) {
      this.pushPolarVertex(r3, i * PI / 2 - this.angl0 / 2, - this.height + .4)
      this.pushPolarVertex(r3, i * PI / 2 + this.angl0 / 2, - this.height + .4)
      this.pushPolarVertex(r3, i * PI / 2 + this.angl0 / 2, - this.height)
      this.pushPolarVertex(r3, i * PI / 2 - this.angl0 / 2, - this.height)
    }
    console.log(this.VertexCount)

    for (i = 0; i < 4; i++) {
      const [v0, v1, v2] = this.getVertices(i * 6, i * 6 + 4, i * 6 + 5)
      this.addHorn(angles[i * 6], v0)
      this.addHorn(angles[i * 6 + 4], v1)
      this.addHorn(angles[i * 6 + 5], v2)
    }

    i = 0
    for (const vertex of this.everyVertex()) {
      if (i % 6 === 2) {
        i += 1
        continue
      }
      this.addBar(vertex, angles[i])
      i += 1
    }

    const horns = this.things.filter(x => x instanceof HornThing)
    for (i = 0; i < 4; i += 1) {
      const [v0, v1] = horns[i * 3].getVertices(HornThing.HEAD_VERTEX_INDEX, HornThing.LEFT_VERTEX_INDEX)
      const [v2, v3] = horns[i * 3 + 1].getVertices(HornThing.HEAD_VERTEX_INDEX, HornThing.RIGHT_VERTEX_INDEX)
      this.addEaves(v0, v1, v3, v2)
    }

    for (i = 0; i < 4; i += 1) {
      const vertices = this.getVertices(
        24 + i * 4,
        24 + i * 4 + 1,
        24 + i * 4 + 2,
        24 + i * 4 + 3,

        24 + i * 4 + 1,
        24 + ((i + 1) % 4) * 4,
        24 + ((i + 1) % 4) * 4 + 3,
        24 + i * 4 + 2
      )
      this.addGuardrail(...vertices.slice(0, 4))
      this.addGuardrail(...vertices.slice(4, 8))
    }
  }

  render(gl: WebGLRenderingContext) {
    const [vertexCount] = this.pipeAllThings()

    const renderers = this.things.map(h => h.render(gl))

    return () => {
      gl.drawArrays(
        gl.POINTS,
        0,
        vertexCount
      )
      for (const renderer of renderers) renderer()
    }
  }
}