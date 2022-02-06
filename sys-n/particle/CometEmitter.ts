import * as THREE from "three"
import { AU } from "../../sys/constants"
import { CelestialBody } from "../gravity"
import { CelestialObjParticleEmitter } from "./CelestialObjEmitter"
import { ParticleEmitter } from "./Emitter"
import { Particle } from "./Particle"
import { random } from "./util"

type CometParticleEmitterType = "dust" | "gas" | "self"

export class CometParticleEmitter extends CelestialObjParticleEmitter {
  type: CometParticleEmitterType
  color: THREE.Vector3 = null

  constructor(celestialObj: CelestialBody, type: CometParticleEmitterType) {
    super(celestialObj)
    this.type = type
    this.color = this.getColor()
  }

  private getColor() {
    switch (this.type) {
      case "dust":
        return new THREE.Vector3(0.8, 0.6, 0.1)
      case "gas":
        return new THREE.Vector3(0.1, 0.5, 0.8)
      case "self":
        return new THREE.Vector3(1, 1, 1)
    }
  }

  override onEmit(particle: Particle): void {
    particle.position.copy(this.position)
    particle.color = this.color
    const towards = this.position.clone().normalize()
    switch (this.type) {
      case "dust": {
        particle.life = random(1, 2)
        // follow the comet
        particle.velocity.copy(this.velocity)
        particle.acceleration.copy(towards.setLength(random(2000, 3000)))
        break
      }
      case "gas": {
        particle.life = random(0.2, 1)
        // point to star
        particle.velocity.copy(towards.setLength(random(700000, 900000)))
        particle.acceleration.copy(towards.setLength(random(20000, 24000)))
        break
      }
      case "self": {
        particle.life = random(0.1, 0.5)
        particle.velocity.copy(this.velocity)
        particle.velocity.add(
          new THREE.Vector3(
            random(-30000, 30000),
            random(-30000, 30000),
            random(-30000, 30000)
          )
        )
        break
      }
    }
  }
}
