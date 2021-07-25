import * as THREE from 'three'
import {
  BodyInfo,
} from "../../sys/body-info"
import { SECONDS_IN_A_DAY } from "../../sys/constants"

import { CelestialBody } from "../gravity"
import { BOOTSTRAP_STATE, toThreeJSCSMat } from "../jpl-data"
import { path, point, tail } from "../providers"
import { FAR_OF_CAMERA, system, initializeSystem } from './solar-data'
import { CAMERA_POSITION_Y } from '../settings'
import * as Editor from '../editor'
import { Shutte, ShutteInfo } from "../shutte"

const bootstrap = (scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.Camera) => {

  initializeSystem(system, null)

  const star = system.celestialBody
  star.init(scene)
  const next = CelestialBody.createUniNextFn(star)

  lookAt(star, camera, CAMERA_POSITION_Y)

  const animate = () => {
    requestAnimationFrame(animate)
    next()
    renderer.render(scene, camera)
  }
  animate()
}

const lookAt = (b: CelestialBody, camera: THREE.Camera, far: number) => {
  const mat = new THREE.Matrix4().makeTranslation(
    ...b.positionArr
  )
  camera.position.copy(new THREE.Vector3(...FAR_OF_CAMERA).applyMatrix4(mat))
  camera.up.set(0, 1, 0)
  camera.lookAt(new THREE.Vector3(0, 0, 0).applyMatrix4(mat))
}

export default bootstrap
export {
  bootstrap
}