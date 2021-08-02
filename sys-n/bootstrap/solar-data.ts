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
  Charon,
  Titan,
  Nereid,
  Rhea,
  Enceladus,
} from "../../sys/body-info"
import { AU } from "../../sys/constants"
import { CelestialBody } from "../gravity"
import * as IMAGES from '../../planets-inf/images'

import { BOOTSTRAP_STATE } from "../jpl-data"
import { point, sphere } from "../providers"

const mercurySystem: CelestialSystem = {
  path: true,
  body: Mercury,
  bootstrapState: BOOTSTRAP_STATE.Mercury
}

const venusSystem: CelestialSystem = {
  body: Venus,
  path: true,
  bootstrapState: BOOTSTRAP_STATE.Venus
}

const earthSystem: CelestialSystem = {
  body: Earth,
  bootstrapState: BOOTSTRAP_STATE.Earth,
  path: false,
  provider: sphere,
  subSystems: [
    {
      body: Luna,
      provider: sphere,
      moon: true,
      path: false,
      bootstrapState: BOOTSTRAP_STATE.Luna
    }
  ]
}

const marsSystem: CelestialSystem = {
  body: { ...Mars, map: IMAGES.K_8K_MARS_JPG },
  bootstrapState: BOOTSTRAP_STATE.Mars,
  path: false,
  rotates: true,
  provider: sphere,
  subSystems: [
    {
      body: Phobos,
      moon: true,
      path: true,
      provider: point,
      bootstrapState: BOOTSTRAP_STATE.Phobos
    },
    { body: Deimos, moon: true, }
  ]
}

const jupiterSystem: CelestialSystem = {
  body: Jupiter,
  bootstrapState: BOOTSTRAP_STATE.Jupiter,
  subSystems: [
    { body: Lo, moon: true, },
    { body: Europa, moon: true, },
    { body: Ganymede, moon: true, },
    { body: Callisto, moon: true, }
  ]
}

const saturnSystem: CelestialSystem = {
  body: { ...Saturn, map: IMAGES.K_8K_SATURN_JPG },
  bootstrapState: BOOTSTRAP_STATE.Saturn,
  provider: sphere,
  subSystems: [
    {
      body: Titan,
      moon: true,
      bootstrapState: BOOTSTRAP_STATE.Titan
    },
    {
      body: Rhea,
      moon: true,
      bootstrapState: BOOTSTRAP_STATE.Rhea
    },
    {

      body: Enceladus,
      moon: true,
      bootstrapState: BOOTSTRAP_STATE.Enceladus
    },
  ]
}

const neptuneSystem: CelestialSystem = {
  body: { ...Neptune, map: IMAGES.K_2K_NEPTUNE_JPG },
  bootstrapState: BOOTSTRAP_STATE.Neptune,
  path: false,
  provider: sphere,
  rotates: true,
  subSystems: [
    {
      moon: true,
      path: true,
      body: Nereid,
      bootstrapState: BOOTSTRAP_STATE.Nereid
    }
  ]
}

const uranusSystem: CelestialSystem = {
  provider: sphere,
  rotates: true,
  body: { ...Uranus, map: IMAGES.K_2K_URANUS_JPG },
  bootstrapState: BOOTSTRAP_STATE.Uranus
}

const plutoSystem: CelestialSystem = {
  provider: sphere,
  rotates: true,
  body: { ...Pluto, map: IMAGES.MAPS_PLUTO_2048X1024_JPG },
  bootstrapState: BOOTSTRAP_STATE.Pluto,
  subSystems: [
    {
      moon: true,
      body: Charon,
      provider: point,
      bootstrapState: BOOTSTRAP_STATE.Charon
    }
  ]
}

const comets: CelestialSystem[] = [
  {
    body: Halley,
    bootstrapState: BOOTSTRAP_STATE.Halley,
  },
  {
    path: true,
    tail: false,
    body: Tempel1,
    bootstrapState: BOOTSTRAP_STATE.Tempel1
  },
  {
    body: Holmes,
    bootstrapState: BOOTSTRAP_STATE.Holmes
  },
  {
    body: HaleBopp
  }
]

export const FAR_OF_CAMERA: THREE.Vector3Tuple = [0, 2 * AU, 0]

export const system: CelestialSystem = {
  body: Sun,
  bootstrapState: BOOTSTRAP_STATE.Sol,
  subSystems: [
    ...comets,
    mercurySystem,
    venusSystem,
    earthSystem,
    marsSystem,
    jupiterSystem,
    saturnSystem,
    uranusSystem,
    neptuneSystem,
    plutoSystem
  ]
}

type SystemNames = 'Sun' | 'Earth' | 'Mars' | 'Mercury' | 'Venus' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto' | 'Halley' | 'Tempel1' | 'Holmes' | 'HaleBopp' | 'Charon' | 'Nereid' | 'Enceladus' | 'Rhea' | 'Titan' | 'Lo' | 'Europa' | 'Ganymede' | 'Callisto' | 'Phobos' | 'Deimos' | 'Luna'
type SystemOn = Array<SystemNames>
let onoffs: SystemOn = []
export const setSystemsActive = (options: SystemOn) => {
  onoffs = options
}

export const initializeSystem = (sys: CelestialSystem, parent: CelestialSystem) => {
  if (!onoffs.includes(sys.body.name as SystemNames)) return
  if (sys.hidden === true) return
  if (!sys.bootstrapState) return
  sys.celestialBody = new CelestialBody(sys)

  if (parent) {
    parent.celestialBody.add(sys.celestialBody)
  }

  if (sys.subSystems) {
    for (const subSys of sys.subSystems) {
      const info = subSys as BodyInfo
      if (info.name) {
        initializeSystem({ body: info }, sys)
      } else {
        initializeSystem(subSys as CelestialSystem, sys)
      }
    }
  }
}

