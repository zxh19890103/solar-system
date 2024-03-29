import * as THREE from "three"
import { CelestialBody } from "../gravity"
import { Particle } from "./Particle"
import { ParticleSystem } from "./System"
import { random } from "./util"

export abstract class ParticleEmitter extends Particle {
  private particles: Particle[] = []
  system: ParticleSystem = null
  isEmitting = false
  size = 0
  rate = 3

  onParticleCreated: (par: Particle) => void
  onParticleDead: (par: Particle) => void

  emit() {
    if (this.dead) return
    let c = this.rate
    this.isEmitting = true
    while (c--) {
      const particle = new Particle({
        life: random(0.2, 10),
        radius: random(0.3, 3),
        alpha: random(0, 1),
      })

      particle.parent = this

      this.onEmit(particle)

      this.particles.push(particle)
      this.onParticleCreated(particle)
      this.size += 1
    }

    this.isEmitting = false
  }

  update(deltaTime: number) {
    if (this.isEmitting) return

    super.update(deltaTime)

    let n = this.particles.length
    let particle: Particle = null

    while (n--) {
      particle = this.particles[n]
      if (particle.dead) {
        this.particles.splice(n, 1)
        this.size -= 1
        this.onParticleDead(particle)
        continue
      }
      particle.update(deltaTime)
    }
  }

  abstract onEmit(particle: Particle): void
}
