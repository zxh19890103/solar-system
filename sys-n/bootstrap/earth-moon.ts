import * as THREE from 'three'
import { Earth, Luna, Mercury, Sun, Venus } from "../../sys/body-info"
import { AU } from '../../sys/constants'
import { CelestialBody } from '../gravity'
import { BOOTSTRAP_STATE, toThreeJSCSMat } from '../jpl-data'
import { sphere, point } from "../providers"
import { initializeSystem } from './solar-data'

const bootstrap: AppBoot = (scene, renderer, camera) => {

  const sys: CelestialSystem = {
    body: { ...Earth },
    bootstrapState: BOOTSTRAP_STATE.Earth,
    provider: point,
    rotates: true,
    subSystems: [
      {
        body: { ...Luna },
        rotates: true,
        provider: point,
        bootstrapState: BOOTSTRAP_STATE.Luna,
      }
    ]
  }

  initializeSystem(sys, null)

  const star = sys.celestialBody
  star.init(scene)
  const next = CelestialBody.createUniNextFn(star)

  const sunLight = new THREE.DirectionalLight(0xffffff, .8)
  sunLight.position.set(0, 0, 1)
  scene.add(sunLight)
  const ambientLight = new THREE.AmbientLight(0xffffff, .1)
  scene.add(ambientLight)

  const luna = star.find('Luna')

  camera.position.set(0, 0, 500)
  camera.up.set(0, 1, 0)
  camera.lookAt(0, 0, 0)

  star.o3.add(line(new THREE.Vector3(...luna.positionArr), Earth.radius * 4))
  // star.o3.add(camera)

  const animate = () => {
    requestAnimationFrame(animate)
    next()
    renderer.render(scene, camera)
  }
  animate()
}

const line = (nor: THREE.Vector3, leng: number) => {
  const material = new THREE.LineBasicMaterial({ color: 0xffffff })
  const geo = new THREE.BufferGeometry().setAttribute(
    'position',
    new THREE.Float32BufferAttribute([
      0, 0, 0, ...nor.setLength(leng).toArray()
    ], 3)
  )
  const line = new THREE.Line(geo, material)
  return line
}

export {
  bootstrap
}