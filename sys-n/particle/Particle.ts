import * as THREE from "three"
import { Object3D } from "three"

let uid = 1998

export class Particle {
  readonly life: number = 1
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

  constructor(life: number) {
    this.life = life
    this.id = `particle-${uid + 1}`
    this.color.set(Math.random(), Math.random(), Math.random())
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
    const oldVel = this.velocity.clone()
    const oldAcc = this.acceleration.clone()

    this.position.add(oldVel.multiplyScalar(deltaTime))
    this.velocity.add(oldAcc.multiplyScalar(deltaTime))

    this.alpha = Math.max(0, 1 - this.age / this.life)
    this.acceleration.multiplyScalar(this.alpha)

    const body = this.body
    body.position.copy(this.position)
    // body.geometry.setAttribute(
    //   "alpha",
    //   new THREE.Float32BufferAttribute([this.alpha], 1)
    // )
  }
}
