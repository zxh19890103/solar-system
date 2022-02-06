import { Object3D } from "three"
import { CelestialBody } from "../gravity"
import { particle } from "../providers"
import { CelestialObjParticleEmitter } from "./CelestialObjEmitter"
import { CometParticleEmitter } from "./CometEmitter"
import { ParticleEmitter } from "./Emitter"
import { Particle } from "./particle"

export class ParticleSystem {
  emitters: ParticleEmitter[] = []
  renderer: THREE.Scene
  container: Object3D = null
  pool: Set<Object3D> = new Set()
  onEmitterDead: (emitter: ParticleEmitter) => void

  constructor(container: Object3D) {
    this.container = container
  }

  makeCelestialObjectTobeEmitter(body: CelestialBody) {
    const emitter = new CelestialObjParticleEmitter(body)
    this.addEmitter(emitter)
  }

  makeComets(body: CelestialBody) {
    const dust = new CometParticleEmitter(body, 'dust')
    this.addEmitter(dust)
  }

  addEmitter(emitter: ParticleEmitter) {
    this.emitters.push(emitter)
    emitter.system = this

    emitter.onParticleCreated = (par: Particle) => {
      const o3d = particle(par.color)
      par.body = o3d
      this.pool.add(o3d)
      this.container.add(o3d)
    }

    emitter.onParticleDead = (par: Particle) => {
      this.pool.delete(par.body)
      this.container.remove(par.body)
    }
  }

  update() {
    const deltaTime = 0.0167
    let n = this.emitters.length
    let emitter: ParticleEmitter = null

    while (n--) {
      emitter = this.emitters[n]
      emitter.update(deltaTime)
      emitter.emit()

      if (emitter.dead) {
        if (emitter.size === 0) {
          this.emitters.splice(n, 1)
          this.onEmitterDead && this.onEmitterDead(emitter)
        }
      }
    }
  }
}
