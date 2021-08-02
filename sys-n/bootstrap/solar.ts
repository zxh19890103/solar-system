import * as THREE from 'three'
import { CelestialBody, setVec3RelativeTo } from "../gravity"
import { FAR_OF_CAMERA, system, initializeSystem, setSystemsActive } from './solar-data'
import { CAMERA_POSITION_Y } from '../settings'
import { makeCameraEditable } from '../editor'
import { AU } from '../../sys/constants'

const bootstrap = (scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.Camera) => {

  setSystemsActive(['Sun', 'Earth', 'Luna'])
  initializeSystem(system, null)

  const star = system.celestialBody
  star.init(scene)
  const next = CelestialBody.createUniNextFn(star)

  const sunLight = new THREE.PointLight(0xffffff, 1)
  sunLight.position.set(0, 0, 0)
  scene.add(sunLight)
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)

  renderer.physicallyCorrectLights = true

  const mars = star.find('Mars')
  const neptune = star.find('Neptune')
  const uranus = star.find('Uranus')
  const pluto = star.find('Pluto')
  const earth = star.find('Earth')
  const luna = earth.find('Luna')

  camera.up.set(0, 1, 0)
  camera.position.set(0, 0, 0)
  luna.o3.add(camera)

  const animate = () => {
    requestAnimationFrame(animate)
    next()
    camera.lookAt(...earth.positionArr)
    renderer.render(scene, camera)
  }
  animate()
}

export default bootstrap
export {
  bootstrap
}