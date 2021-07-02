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
import { SECONDS_IN_A_DAY } from "../sys/constants"

import { CelestialBody } from "./gravity"
import { toThreeJSCSMat, BOOTSTRAP_STATE } from "./jpl-data"
import { point } from "./providers"

const system: CelestialSystem = {
  body: Sun,
  subSystems: [
    {
      hidden: true,
      body: Halley,
      bootstrapState: BOOTSTRAP_STATE.Halley,
    },
    {
      hidden: true,
      body: Tempel1,
      bootstrapState: BOOTSTRAP_STATE.Tempel1
    },
    {
      hidden: true,
      body: Holmes,
      bootstrapState: BOOTSTRAP_STATE.Holmes
    },
    {
      hidden: true,
      body: Mercury,
      bootstrapState: BOOTSTRAP_STATE.Mercury
    },
    {
      hidden: true,
      body: Venus,
      bootstrapState: BOOTSTRAP_STATE.Venus
    },
    {
      hidden: false,
      body: Earth,
      bootstrapState: BOOTSTRAP_STATE.Earth,
      subSystems: [
        {
          hidden: false,
          moon: true,
          body: Luna,
          bootstrapState: BOOTSTRAP_STATE.Luna
        }
      ]
    },
    {
      hidden: true,
      body: Mars,
      bootstrapState: BOOTSTRAP_STATE.Mars,
      subSystems: [
        { body: Phobos, hidden: true, moon: true, },
        { body: Deimos, hidden: true, moon: true, }
      ]
    },
    {
      hidden: true,
      body: Neptune,
      bootstrapState: BOOTSTRAP_STATE.Neptune
    },
    {
      hidden: true,
      body: Pluto,
      bootstrapState: BOOTSTRAP_STATE.Pluto
    },
    {
      hidden: true,
      body: Jupiter,
      bootstrapState: BOOTSTRAP_STATE.Jupiter,
      subSystems: [
        { body: Lo, hidden: true, moon: true, },
        { body: Europa, hidden: true, moon: true, },
        { body: Ganymede, hidden: true, moon: true, },
        { body: Callisto, hidden: true, moon: true, }
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
    sys.celestialBody = new CelestialBody(point(sys.body), sys.body, Boolean(sys.moon))
    if (parent) {
      parent.celestialBody.add(sys.celestialBody)
    }

    if (sys.bootstrapState) {
      sys.celestialBody.init(transformPosition(sys.bootstrapState.posi), transformVelocity(sys.bootstrapState.velo))
    } else {
      sys.celestialBody.init()
    }

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
  const next = CelestialBody.bootstrap(scene, star)

  let earth: CelestialBody = null

  for (const b of star.children) {
    if (b.info === Earth) {
      earth = b
    }
  }

  const camPos = earth.o3.position.clone()

  camPos.setY(50000)

  camera.position.set(...camPos.toArray())
  camera.up.set(0, 1, 0)

  if (earth) {
    camera.lookAt(earth.o3.position)
  } else {
    camera.lookAt(0, 0, 0)
  }

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