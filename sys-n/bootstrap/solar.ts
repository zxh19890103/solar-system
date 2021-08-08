import * as THREE from 'three'
import { CelestialBody, setVec3RelativeTo } from "../gravity"
import { FAR_OF_CAMERA, system, initializeSystem, setSystemsActive, setSystemOptions } from './solar-data'
import { CAMERA_POSITION_Y } from '../settings'
import { makeCameraEditable } from '../editor'
import { AU } from '../../sys/constants'
import { point, sphere } from '../providers'

const bootstrap = (scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.Camera) => {

  setSystemOptions({ name: 'Earth', path: false, provider: sphere, rotates: true }, 'Sun', { name: 'Luna', provider: point, path: true })
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

  const earth = star.find('Earth')

  camera.up.set(0, 1, 0)
  camera.position.set(0, 0, 10)
  camera.lookAt(0, 0, 0)

  earth.o3.add(camera)

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