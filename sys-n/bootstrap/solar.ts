import * as THREE from 'three'
import { CelestialBody } from "../gravity"
import { FAR_OF_CAMERA, system, initializeSystem } from './solar-data'
import { CAMERA_POSITION_Y } from '../settings'
import { makeCameraEditable } from '../editor'

const bootstrap = (scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.Camera) => {

  initializeSystem(system, null)

  const star = system.celestialBody
  star.init(scene)
  const next = CelestialBody.createUniNextFn(star)

  const sunLight = new THREE.DirectionalLight(0xffffff, .5)
  sunLight.position.set(0, 0, 1)
  scene.add(sunLight)
  const ambientLight = new THREE.AmbientLight(0xffffff, .1)
  scene.add(ambientLight)

  const mars = star.find('Mars')
  const earth = star.find('Earth')

  camera.up.set(0, 1, 0)
  camera.lookAt(0, 0, 0)
  camera.position.set(10, 40, 50)
  mars.o3.add(camera)

  const animate = () => {
    requestAnimationFrame(animate)
    next()
    renderer.render(scene, camera)
  }
  animate()
}

export default bootstrap
export {
  bootstrap
}