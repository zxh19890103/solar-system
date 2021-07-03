import {
  Earth,
  BodyInfo,
  Pluto,
  Mars,
  Halley,
} from "../sys/body-info"
import { AU, SECONDS_IN_A_DAY } from "../sys/constants"

import { CelestialBody } from "./gravity"
import { BOOTSTRAP_STATE, toThreeJSCSMat } from "./jpl-data"
import { path, point } from "./providers"
import { system } from './solar-data'

const transformPosition = (value: THREE.Vector3Tuple) => {
  if (!value) return null
  return new THREE.Vector3().set(...value).applyMatrix4(toThreeJSCSMat)
}

const transformVelocity = (value: THREE.Vector3Tuple) => {
  if (!value) return null
  return new THREE.Vector3().set(...value).divideScalar(SECONDS_IN_A_DAY).applyMatrix4(toThreeJSCSMat)
}

const make = () => {
  const mkNode = (sys: CelestialSystem, parent: CelestialSystem) => {
    if (sys.hidden || !sys.bootstrapState) return
    sys.celestialBody = new CelestialBody(point(sys.body), sys.body, Boolean(sys.moon))
    // sys.celestialBody.pathO3 = path(sys.body)
    if (parent) {
      parent.celestialBody.add(sys.celestialBody)
    }

    sys.celestialBody.init(transformPosition(sys.bootstrapState.posi), transformVelocity(sys.bootstrapState.velo))

    if (sys.subSystems) {
      for (const subSys of sys.subSystems) {
        const info = subSys as BodyInfo
        if (info.name) {
          mkNode({ body: info }, sys)
        } else {
          mkNode(subSys as CelestialSystem, sys)
        }
      }
    }
  }

  mkNode(system, null)
}

const bootstrap = (scene: THREE.Scene, renderer: THREE.Renderer, camera: THREE.Camera) => {

  make()

  const star = system.celestialBody
  const next = CelestialBody.createUniNextFn(scene, star)

  lookAt(star, camera, 4 * AU)

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
  camera.position.copy(new THREE.Vector3(0, far, 0).applyMatrix4(mat))
  camera.up.set(0, 1, 0)
  camera.lookAt(new THREE.Vector3(0, 0, 0).applyMatrix4(mat))
}

export default bootstrap
export {
  bootstrap
}