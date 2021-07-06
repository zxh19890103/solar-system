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
    ref.traverse(b => {
      if (b === this) return
      this.gravityCaringObjects.push(b)
    }, 10)
  }

  private velocity = new THREE.Vector2()

  private initControl() {
    document.addEventListener('keydown', (evt) => {
      evt.stopPropagation()
      evt.preventDefault()
      this.velocity.set(this.velocityArr[0], this.velocityArr[2])
      const l = this.velocity.length()
      switch (evt.key) {
        case 'ArrowUp':
          this.velocityArr[1] += DELTA
          break
        case 'ArrowDown':
          this.velocityArr[1] -= DELTA
          break
        case 'ArrowLeft':
          this.velocity.setLength(l - DELTA)
          this.velocityArr[2] = this.velocity.y
          this.velocityArr[0] = this.velocity.x
          break
        case 'ArrowRight':
          this.velocity.setLength(l + DELTA)
          this.velocityArr[2] = this.velocity.y
          this.velocityArr[0] = this.velocity.x
          break
      }
    })
  }
}