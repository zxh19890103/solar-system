import * as THREE from 'three'
import { Earth, Uranus, Jupiter, Mars, Neptune, Saturn } from "../../sys/body-info"
import { AU } from "../../sys/constants"
import { CelestialBody } from "../gravity"
import { sphere, ring } from "../providers"

const bootstrap: AppBoot = (scene, renderer, camera) => {
  // const uranus = sphere(Uranus)
  const earth = sphere(Earth)
  // const mars = sphere(Mars)
  // const jupiter = sphere(Jupiter)
  // const neptune = sphere(Neptune)
  // const saturn = sphere(Saturn)
  // const uranusRing = ring(Uranus)
  // o3.add(uranusRing)
  // scene.add(uranus)
  scene.add(earth)
  // scene.add(mars)
  // scene.add(jupiter)
  // scene.add(neptune)
  // scene.add(saturn)

  // earth.position.set(35, 0, 0)
  // jupiter.position.set(-100, 0, 0)
  // mars.position.set(50, 0, 0)
  // neptune.position.set(80, 0, 0)
  // saturn.position.set(170, 0, 0)

  const sunLight = new THREE.DirectionalLight(0xffffff, .8)
  sunLight.position.set(1, .2, 0)
  scene.add(sunLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, .03)
  scene.add(ambientLight)

  camera.position.set(0, 0, 20)
  camera.up.set(0, 1, 0)
  camera.lookAt(0, 0, 0)

  const animate = () => {
    requestAnimationFrame(animate)
    // uranus.rotation.y += .003
    earth.rotation.y += .003
    // jupiter.rotation.y += .003
    // mars.rotation.y += .003
    // neptune.rotation.y += .004
    // saturn.rotation.y += .001
    renderer.render(scene, camera)
  }
  animate()
}

export {
  bootstrap
}