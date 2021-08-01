import * as THREE from 'three'
import { Earth, Luna, Mercury, Sun, Venus } from "../../sys/body-info"
import { AU } from '../../sys/constants'
import { CelestialBody } from '../gravity'
import { BOOTSTRAP_STATE, toThreeJSCSMat } from '../jpl-data'
import { sphere, point } from "../providers"
import { initializeSystem } from './solar-data'

const bootstrap: AppBoot = (scene, renderer, camera) => {

  const sys: CelestialSystem = {
    body: Earth,
    bootstrapState: BOOTSTRAP_STATE.Earth,
    provider: sphere,
    rotates: true,
    subSystems: [
      {
        body: { ...Luna },
        rotates: false,
        provider: sphere,
        path: true,
        bootstrapState: BOOTSTRAP_STATE.Luna,
      }
    ]
  }

  initializeSystem(sys, null)

  const star = sys.celestialBody
  star.init(scene)
  const next = CelestialBody.createUniNextFn(star)

  const luna = star.find('Luna')
  const earth = star

  const sunLight = new THREE.DirectionalLight(0xffffff, .8)
  sunLight.position.set(0, 0, 1)
  scene.add(sunLight)
  const ambientLight = new THREE.AmbientLight(0xffffff, .1)
  scene.add(ambientLight)

  // 10 ^ 3 km
  const line = luna.position.clone().sub(earth.position).setLength(31 * 1000 * 1.60934)

  camera.position.set(...line.toArray())
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