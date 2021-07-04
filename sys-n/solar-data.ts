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
} from "../sys/body-info"

import { BOOTSTRAP_STATE } from "./jpl-data"

const mercurySystemActive = true
const mercurySystem: CelestialSystem = {
  hidden: !mercurySystemActive,
  path: true,
  body: Mercury,
  bootstrapState: BOOTSTRAP_STATE.Mercury
}

const venusSystemActive = true
const venusSystem: CelestialSystem = {
  hidden: !venusSystemActive,
  body: Venus,
  path: true,
  bootstrapState: BOOTSTRAP_STATE.Venus
}

const earthSystemActive = true
const earthSystem: CelestialSystem = {
  hidden: !earthSystemActive,
  body: Earth,
  bootstrapState: BOOTSTRAP_STATE.Earth,
  path: true,
  subSystems: [
    {
      hidden: false,
      moon: true,
      path: false,
      body: Luna,
      bootstrapState: BOOTSTRAP_STATE.Luna
    }
  ]
}

const marsSystemActive = true
const marsSystem: CelestialSystem = {
  hidden: !marsSystemActive,
  body: Mars,
  bootstrapState: BOOTSTRAP_STATE.Mars,
  path: true,
  subSystems: [
    {
      body: Phobos,
      hidden: true,
      moon: true,
      bootstrapState: BOOTSTRAP_STATE.Phobos
    },
    { body: Deimos, hidden: true, moon: true, }
  ]
}

const plutoSystemActive = false
const plutoSystem: CelestialSystem = {
  hidden: !plutoSystemActive,
  body: Pluto,
  bootstrapState: BOOTSTRAP_STATE.Pluto,
  subSystems: [
    {
      moon: true,
      body: Charon,
      bootstrapState: BOOTSTRAP_STATE.Charon
    }
  ]
}

const jupiterSystemActive = false
const jupiterSystem: CelestialSystem = {
  hidden: !jupiterSystemActive,
  body: Jupiter,
  bootstrapState: BOOTSTRAP_STATE.Jupiter,
  subSystems: [
    { body: Lo, hidden: true, moon: true, },
    { body: Europa, hidden: true, moon: true, },
    { body: Ganymede, hidden: true, moon: true, },
    { body: Callisto, hidden: true, moon: true, }
  ]
}

const saturnSystemActive = false
const saturnSystem: CelestialSystem = {
  hidden: !saturnSystemActive,
  body: Saturn,
  bootstrapState: BOOTSTRAP_STATE.Saturn,
  subSystems: [
    {
      hidden: false,
      body: Titan,
      path: true,
      moon: true,
      bootstrapState: BOOTSTRAP_STATE.Titan
    }
  ]
}

const neptuneSystemActive = false
const neptuneSystem: CelestialSystem = {
  hidden: !neptuneSystemActive,
  body: Neptune,
  bootstrapState: BOOTSTRAP_STATE.Neptune,
  subSystems: [
    {
      hidden: false,
      moon: true,
      path: true,
      body: Nereid,
      bootstrapState: BOOTSTRAP_STATE.Nereid
    }
  ]
}

const uranusSystemActive = false
const uranusSystem: CelestialSystem = {
  hidden: !uranusSystemActive,
  body: Uranus,
  bootstrapState: BOOTSTRAP_STATE.Uranus
}

const comets: CelestialSystem[] = [
  {
    hidden: true,
    body: Halley,
    bootstrapState: BOOTSTRAP_STATE.Halley,
  },
  {
    hidden: true,
    path: true,
    tail: false,
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
    body: HaleBopp
  }
]

export const system: CelestialSystem = {
  hidden: false,
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
