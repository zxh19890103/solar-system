import * as THREE from "three"
import { Object3D } from "three"
import { random } from "./util"

let uid = 1998

interface ParticleOptions {
  life: number
  radius: number
  alpha: number
  color?: THREE.Vector3
}

export class Particle {
  life: number = 1
  age: number = 0
  body: THREE.Points = null
  mass: number = 1
  dead: boolean = false
  radius: number = 1
  alpha: number = 1
  energy: number = 1
  position: THREE.Vector3 = new THREE.Vector3()
  velocity: THREE.Vector3 = new THREE.Vector3()
  acceleration: THREE.Vector3 = new THREE.Vector3()
  color: THREE.Vector3 = new THREE.Vector3(1, 1, 1)

  id: string
  parent: Particle = null

  constructor(options: ParticleOptions) {
    this.id = `particle-${uid + 1}`
    this.life = options.life
    options.color && (this.color = options.color)
    this.radius = options.radius
    this.alpha = options.alpha
  }

  update(deltaTime: number) {
    this.age += deltaTime

    this.onUpdate(deltaTime)

    if (this.age >= this.life) {
      this.dead = true
      this.energy = 0
      this.parent = null
    }
  }

  protected onUpdate(deltaTime: number) {
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime))
    this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime))

    const body = this.body
    body.position.copy(this.position)
  }
}
