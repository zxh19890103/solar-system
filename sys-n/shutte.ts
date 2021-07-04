import { BodyInfo } from "../sys/body-info"
import { AU } from "../sys/constants"
import { CelestialBody, computeAccBy, computeAccOfCelestialBody, insertCanvas } from "./gravity"
import { point } from "./providers"
import { BUFFER_SIZE, G, MOMENT } from "./settings"

export const ShutteInfo: BodyInfo = {
  name: "Space Shuttle",
  aphelion: 0,
  peribelion: 0,
  semiMajorAxis: 0,
  avatar: "",
  map: "",
  color: [0, 1, .5, 1],
  mass: .0001,
  radius: 1,
  inclination: 0,
}

const DELTA = .0001

export class Shutte extends CelestialBody {

  constructor(sys: CelestialSystem) {
    super(sys)
  }

  override init(scene: THREE.Scene) {
    super.init(scene)
    this.initControl()
  }

  override initialGravityCaringObjects() {
    let ref = this.ref
    while (ref.ref) {
      ref = ref.ref
    }
    const a = (b: CelestialBody) => {
      if (b !== this)
        this.gravityCaringObjects.push(b)
      for (const child of b.children)
        a(child)
    }
    a(ref)
  }

  private initControl() {
    document.addEventListener('keydown', (evt) => {
      evt.stopPropagation()
      evt.preventDefault()
      console.log(evt.key)
      switch (evt.key) {
        case 'ArrowUp':
          if (evt.metaKey) {
            this.velocityArr[1] += DELTA
          } else {
            this.velocityArr[2] -= DELTA
          }
          break
        case 'ArrowDown':
          if (evt.metaKey) {
            this.velocityArr[1] -= DELTA
          } else {
            this.velocityArr[2] += DELTA
          }
          break
        case 'ArrowLeft':
          this.velocityArr[0] -= DELTA
          break
        case 'ArrowRight':
          this.velocityArr[0] += DELTA
          break
      }
    })
  }
}