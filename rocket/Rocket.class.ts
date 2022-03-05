import * as THREE from "three"

const textureLoader = new THREE.TextureLoader()

export class Rocket {
  mesh: THREE.Mesh

  setup() {
    const tex = textureLoader.load("/8k/8k_mars.jpg")
    const geometry = new THREE.SphereGeometry(200, 60, 60)
    const material = new THREE.MeshPhongMaterial({
      map: tex,
      specular: 0x000000,
    })

    this.mesh = new THREE.Mesh(geometry, material)
  }

  rotate() {
    this.mesh.rotation.y += 0.01
  }
}
