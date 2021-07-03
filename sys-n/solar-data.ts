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
} from "../sys/body-info"

import { BOOTSTRAP_STATE } from "./jpl-data"

const earthSystemActive = true
const earthSystem: CelestialSystem = {
  hidden: !earthSystemActive,
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
}

const marsSystemActive = true
const marsSystem: CelestialSystem = {
  hidden: !marsSystemActive,
  body: Mars,
  bootstrapState: BOOTSTRAP_STATE.Mars,
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

const comets: CelestialSystem[] = [
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
    body: HaleBopp
  }
]

export const system: CelestialSystem = {
  hidden: false,
  body: Sun,
  bootstrapState: BOOTSTRAP_STATE.Sol,
  subSystems: [
    ...comets,
    {
      hidden: false,
      body: Mercury,
      bootstrapState: BOOTSTRAP_STATE.Mercury
    },
    {
      hidden: false,
      body: Venus,
      bootstrapState: BOOTSTRAP_STATE.Venus
    },
    earthSystem,
    marsSystem,
    {
      hidden: true,
      body: Neptune,
      bootstrapState: BOOTSTRAP_STATE.Neptune
    },
    plutoSystem,
    jupiterSystem
  ]
}
