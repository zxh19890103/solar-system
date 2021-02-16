import { Thing } from "../common/thing.class"
import { parseColor } from "../common/utils"
import { BarThing } from "./bar.class"
import { EavesThing } from "./eaves.class"
import { GuardtailThing } from "./guardrail.class"
import { HornThing } from "./horn.class"
import { WindowThing } from "./window.class"

const { PI, sin, cos } = Math
const {
  vec3
} = glMatrix

export class CeilThing extends Thing {
  readonly r: number
  readonly angl0: number // eaves angle
  readonly angl1: number // horn angle

  private hornL: number = 1
  private hornW: number = 1
  private hornH: number = .4

  constructor(r: number, angl0: number) {
    super()
    this.r = r
    this.angl0 = angl0
    this.angl1 = PI / 2 - angl0

    this.hornW = this.r * Math.tan(this.angl0 / 2) * .6777
  }

  private createHorn(rad, coord) {
    const horn = new HornThing(this.hornL, this.hornW, this.hornH)
    horn.make()
    horn.put(coord, rad - PI / 2)
    this.things.push(horn)
    return horn
  }

  private addHorn(rad: number) {
    const coord = [
      this.r * cos(rad),
      this.r * sin(rad),
      0
    ]
    this.vertices.push(...coord)
    this.colors.push(.9, .2, .2, 1)
    return this.createHorn(rad, coord)
  }

  private addEaves(vertices: vec3[]) {
    const eaves = new EavesThing(...vertices)
    eaves.make()
    this.things.push(eaves)
    return eaves
  }

  private addBarOfHorn(horn: HornThing, rad: number) {
    const head = horn.getVertex(2)
    const coord = [...head] as vec3
    coord[2] -= 1 + horn.height
    this.addBar(coord, rad)
  }

  private addBar(coord: vec3, rad: number) {
    const bar = new BarThing(.1, 1.2)
    bar.make()
    bar.put(coord, rad - PI / 2)
    this.things.push(bar)
  }

  private addBarOfEaves(eaves: EavesThing, rad: number) {
    const [v0, v1] = eaves.getVertices(0, 5)
    const n = [0, 0, 1] as vec3
    vec3.normalize(n, vec3.sub(n, v1, v0))
    const len = vec3.dist(v0, v1)
    const coord0 = vec3.add(
      [0, 0, 0],
      v0,
      vec3.scale([0, 0, 0], n, len * .25))

    const coord1 = vec3.add(
      [0, 0, 0],
      v0,
      vec3.scale([0, 0, 0], n, len * .75))

    coord0[2] -= 1
    coord1[2] -= 1
    this.addBar(coord0, rad)
    this.addBar(coord1, rad)
  }

  private addWindow() {
    const horns = this.things.filter(thing => thing instanceof HornThing) as HornThing[]
    const win = new WindowThing(.3, ...horns)
    win.make()
    this.things.push(win)
  }

  private addGuardrail() {
    const horns = this.things.filter(thing => thing instanceof HornThing) as HornThing[]
    const rail = new GuardtailThing(.4, .6, ...horns)
    rail.make()
    this.things.push(rail)
  }

  make() {
    // 12 horns
    const vertices: vec3[] = []
    for (let a = 0; a < 4; a += 1) {
      const rad = a * (Math.PI / 2)
      const left = this.addHorn(rad - .2)
      this.addBarOfHorn(left, rad - .2)
      vertices.push(...left.getVertices(0, 2, HornThing.KEY_VERTEX_COUNT + 2))
      const middle = this.addHorn(rad)
      this.addBarOfHorn(middle, rad)
      const right = this.addHorn(rad + .2)
      this.addBarOfHorn(right, rad + .2)
      vertices.push(...right.getVertices(HornThing.KEY_VERTEX_COUNT + 1, 1, 2))
      if (a > 0) {
        const six = vertices.splice(3, 6)
        const eaves = this.addEaves(six)
        this.addBarOfEaves(eaves, rad - PI * .25)
      }
    }
    const one = vertices.slice(0, 3)
    const two = vertices.slice(3, 6)
    const eaves = this.addEaves([...two, ...one])
    this.addBarOfEaves(eaves, 0)

    this.addWindow()
    this.addGuardrail()
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