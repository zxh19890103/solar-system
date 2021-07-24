import * as THREE from 'three'
import { Earth, Mercury, Sun, Venus } from "../../sys/body-info"
import { AU } from '../../sys/constants'
import { CelestialBody } from '../gravity'
import { BOOTSTRAP_STATE, toThreeJSCSMat } from '../jpl-data'
import { sphere, point } from "../providers"
import { initializeSystem } from '../solar-data'

const bootstrap: AppBoot = (scene, renderer, camera) => {

  const sys: CelestialSystem = {
    body: { ...Sun },
    bootstrapState: BOOTSTRAP_STATE.Sol,
    provider: sphere,
    subSystems: [
      {
        hidden: true,
        body: Earth,
        bootstrapState: BOOTSTRAP_STATE.Earth,
      },
      {
        body: Mercury,
        provider: sphere,
        bootstrapState: BOOTSTRAP_STATE.Mercury,
      }
    ]
  }

  initializeSystem(sys, null)

  const star = sys.celestialBody
  star.init(scene)
  const next = CelestialBody.createUniNextFn(star)

  const ambientLight = new THREE.AmbientLight(0xffffff, .7)
  scene.add(ambientLight)

  const cameraWhere = new THREE.Vector3(...BOOTSTRAP_STATE.Mercury.posi).applyMatrix4(toThreeJSCSMat)
  cameraWhere.normalize()
  cameraWhere.setLength(AU)
  camera.position.copy(cameraWhere)
  camera.up.set(0, 1, 0)
  camera.lookAt(0, 0, 0)

  const animate = () => {
    requestAnimationFrame(animate)
    next()
    renderer.render(scene, camera)
  }
  animate()
}

export {
  bootstrap
}