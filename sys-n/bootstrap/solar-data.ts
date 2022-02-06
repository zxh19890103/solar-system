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
import { Object3D } from "three"

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
  body: { ...Earth, map: IMAGES.MAPS_EARTH_1000X500_JPG },
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
  body: { ...Mars, map: IMAGES.MAPS_MARS_1024X512_JPG },
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
  body: { ...Saturn },
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

export type SystemName = 'Sun' | 'Earth' | 'Mars' | 'Mercury' | 'Venus' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto' | 'Halley' | 'Tempel1' | 'Holmes' | 'HaleBopp' | 'Charon' | 'Nereid' | 'Enceladus' | 'Rhea' | 'Titan' | 'Lo' | 'Europa' | 'Ganymede' | 'Callisto' | 'Phobos' | 'Deimos' | 'Luna'
const filter: Map<SystemName, boolean> = new Map()
export const setSystemsActive = (names: SystemName[]) => {
  names.forEach(name => {
    filter.set(name, true)
  })
}

type SetSystemAttrsArrayItem = {
  name: SystemName;
  provider?: (info: BodyInfo) => Object3D;
  map?: string;
  color?: vec4;
  hidden?: boolean;
  path?: boolean;
  tail?: boolean;
  rotates?: boolean
}

const sysoptions: Map<SystemName, SetSystemAttrsArrayItem> = new Map();
export const setSystemOptions = (...options: (SystemName | SetSystemAttrsArrayItem)[]) => {
  for (const opt of options) {
    if (typeof opt === 'string') {
      sysoptions.set(opt, { name: opt })
    } else {
      sysoptions.set(opt.name, opt)
    }
  }
}

export const initializeSystem = (sys: CelestialSystem, parent: CelestialSystem) => {

  const name = sys.body.name as SystemName
  if (!sysoptions.has(name)) return
  if (!sys.bootstrapState) return

  {
    // cover
    const { hidden, map, path, tail, rotates, provider, color } = sysoptions.get(name)
    if (hidden !== undefined) sys.hidden = hidden
    if (map !== undefined) sys.body.map = map
    if (path !== undefined) sys.path = path
    if (tail !== undefined) sys.tail = tail
    if (rotates !== undefined) sys.rotates = rotates
    if (provider !== undefined) sys.provider = provider
    if (color !== undefined) sys.body.color = color;
  }

  if (sys.hidden === true) return
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

export const serializeSys = (sys: CelestialSystem) => {
  if (!sys.celestialBody) return null
  const { velocityArr, positionArr } = sys.celestialBody
  const o = {
    r: sys.body.radius,
    n: sys.body.name,
    m: sys.body.mass,
    vx: velocityArr[0],
    vy: velocityArr[1],
    vz: velocityArr[2],
    px: positionArr[0],
    py: positionArr[1],
    pz: positionArr[2],
    oo: []
  }
  if (sys.subSystems) {
    const oo = []
    for (const subSys of sys.subSystems) {
      const info = subSys as BodyInfo
      const ooo = serializeSys(info.aphelion ? { body: info } : subSys as CelestialSystem)
      if (ooo)
        oo.push(ooo)
    }
    if (oo.length > 0) {
      o.oo = oo
    } else {
      delete o.oo
    }
  }
  return o
}