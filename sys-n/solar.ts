import {
  Earth,
  Sun,
  Luna,
  Mars,
  Mercury,
  Venus,
  Jupiter,
  Neptune,
  Saturn,
  Uranus,
  Bodies13,
  BodyInfo,
  Ceres,
  HaleBopp,
  Halley,
  Pluto,
  Tempel1,
  Holmes,
  Phobos,
  Deimos,
  Lo,
  Europa,
  Ganymede,
  Callisto,
} from "../sys/body-info"
import { AU, RAD_PER_DEGREE, SECONDS_IN_A_DAY } from "../sys/constants"

import { CelestialBody } from "./gravity"
import { toThreeJSCSMat } from "./jpl-data/index"
import { dot, sphere, point } from "./providers"

const system: CelestialSystem = {
  body: Sun,
  subSystems: [
    {
      hidden: false,
      body: Earth,
      initialPosition: [1.273555128442919E-01, -1.008595863432608E+00, 5.025624779797198E-05],
      initialVelocity: [1.678506069402309E-02, 2.085228180777305E-03, -2.667715746691512E-08],
      subSystems: [
        {
          hidden: true,
          body: Luna
        }
      ]
    },
    {
      hidden: true,
      body: Mars,
      subSystems: [
        { body: Phobos, hidden: true },
        { body: Deimos, hidden: true }
      ]
    },
    {
      hidden: true,
      body: Jupiter,
      subSystems: [
        { body: Lo },
        { body: Europa },
        { body: Ganymede },
        { body: Callisto }
      ]
    }
  ],
}

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
    if (sys.hidden) return
    sys.celestialBody = new CelestialBody(point(sys.body), sys.body)
    if (parent) {
      parent.celestialBody.add(sys.celestialBody)
    }

    sys.celestialBody.init(transformPosition(sys.initialPosition), transformVelocity(sys.initialVelocity))

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
  const next = star.bootstrap()

  scene.add(star.o3)

  camera.position.set(0, 1000, 1.2 * Mars.aphelion)
  camera.up.set(0, 1, 0)
  camera.lookAt(0, 0, 0)

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