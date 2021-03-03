import { Thing } from "../common/thing.class"
import { FloorThing } from "./floor.class"

const {
  mat4,
  vec3
} = glMatrix

export class Tower extends Thing {

  make(): void {
    const floor1 = new FloorThing(5, Math.PI * .32)
    const floor2 = new FloorThing(5, Math.PI * .32)
    const floor3 = new FloorThing(5, Math.PI * .32)
    floor1.make()
    floor2.make()
    floor3.make()

    floor1.translatate([0, 0, 0])
    floor2.translatate([0, 0, 3])
    floor3.translatate([0, 0, 6])

    this.things.push(
      floor1,
      floor2,
      floor3
    )
  }

  render(gl: WebGLRenderingContext): () => void {
    const renderers = this.things.map(h => h.render(gl))
    this.pipeAllThings()
    // console.log("hhaa", this.VertexCount)
    // console.log("hhssd", this.things.map(x => x.VertexCount))

    return () => {
      for (const renderer of renderers) renderer()
    }
  }

}