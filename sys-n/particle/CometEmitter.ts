import * as THREE from "three"
import { CelestialBody } from "../gravity"
import { CelestialObjParticleEmitter } from "./CelestialObjEmitter"
import { ParticleEmitter } from "./Emitter"
import { Particle } from "./Particle"
import { random } from "./util"

export class CometParticleEmitter extends CelestialObjParticleEmitter {
  type: "dust" | "gas"
  color: THREE.Vector3 = null

  constructor(celestialObj: CelestialBody, type: "dust" | "gas") {
    super(celestialObj)
    this.type = type
    this.color =
      type === "dust"
        ? new THREE.Vector3(0.8, 0.6, 0.1)
        : new THREE.Vector3(0.1, 0.5, 0.8)
  }

  override onEmit(particle: Particle): void {
    particle.position.copy(this.position)
    particle.color = this.color
    const towards = this.position.clone().normalize().setLength(random(30000, 50000));
    // const acc = towards.clone().setLength(random(30000, 50000));
    switch (this.type) {
      case "dust": {
        // follow the comet
        particle.velocity.copy(this.velocity)
        particle.velocity.add(towards)
        // particle.acceleration = acc;
        // zero accle
        break
      }
      case "gas": {
        // point to star
        break
      }
    }
  }
}
