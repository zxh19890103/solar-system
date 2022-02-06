import { CelestialBody } from "../gravity"
import { ParticleEmitter } from "./Emitter"
import { Particle } from "./Particle"
import { random } from "./util"

export class CelestialObjParticleEmitter extends ParticleEmitter {
  celestialBody: CelestialBody = null

  constructor(celestialObj: CelestialBody) {
    super(Infinity)
    this.celestialBody = celestialObj
  }

  onEmit(particle: Particle): void {
    particle.position.copy(this.position)
    particle.velocity.copy(this.velocity)
    particle.acceleration.set(
      random(-300, 300),
      random(-300, 400),
      random(-100, 300)
    )
  }

  protected override onUpdate(deltaTime: number): void {
    this.position.set(...this.celestialBody.positionArr)
    this.velocity.set(...this.celestialBody.velocityArr)
  }
}
