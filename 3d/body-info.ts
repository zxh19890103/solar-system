import { AU, RAD_PER_DEGREE } from "./constants"
import { approximates } from "./utils"

export interface BodyInfo {
  /**
   * name of the planet
   */
  name: string
  /**
   * unit: x 10 ^ 3 km
   */
  aphelion: number
  /**
   * unit: x 10 ^ 3 km
   */
  peribelion: number
  /**
   * unit: x 10 ^ 3 km
   */
  semiMajorAxis: number
  /**
   * the mean radius
   * unit: x 10 ^ 3 km
   */
  radius: number
  /**
   * unit: x 10 ^ 24 kg
   */
  mass: number
  /**
   * the color of the planet.
   */
  color: Iterable<number>
  /**
   * image url relative to path ./planets-inf
   */
  avatar: string
  map: string
  /**
   * to the Sun's equator;
   */
  inclination?: number
  /**
   * the reference system.
   * default is the the solar
   */
  ref?: BodyInfo
}

const COLORS = {
  grey: [128, 128, 128],
  brown: [165, 42, 42],
  blue: [0, 0, 255],
  green: [0, 255, 0],
  white: [255, 255, 255],
  red: [255, 0, 0],
  tan: [210, 180, 140],
  orange: [255, 165, 0],
  golden: [255, 215, 0]
}

const composeColors = (...colors: Array<number[]>) => {
  return colors.reduce(
    (c, i) => {
      return [
        c[0] + i[0],
        c[1] + i[1],
        c[2] + i[2]
      ]
    }
    , [0, 0, 0]).map(c => {
      return (c / colors.length) / 255
    }).concat([1])
}

export const Sun: BodyInfo = {
  name: "Sun",
  aphelion: 0,
  peribelion: 0,
  semiMajorAxis: 0,
  avatar: "/nineplanets-org/sun.png",
  map: "/maps/sun-4096x2048.jpg",
  color: composeColors(COLORS.red),
  mass: 1.9885 * 1000000,
  radius: 696.342,
  inclination: 0
}

export const Mercury: BodyInfo = {
  name: "Mercury",
  aphelion: 69816.900,
  peribelion: 46001.200,
  semiMajorAxis: 57909.050,
  avatar: "/nineplanets-org/mercury.png",
  map: "/maps/mercury-1024x512.jpg",
  color: composeColors(COLORS.grey),
  mass: .33011,
  radius: 2.4397,
  inclination: 3.38 * RAD_PER_DEGREE
}

export const Venus: BodyInfo = {
  name: "Venus",
  aphelion: 108939,
  peribelion: 107477,
  semiMajorAxis: 108208,
  avatar: "/nineplanets-org/venus.png",
  map: "/maps/venus-1024x512.jpg",
  color: composeColors(COLORS.grey, COLORS.brown),
  mass: 4.8675,
  radius: 6.0518,
  inclination: 3.86 * RAD_PER_DEGREE
}

export const Earth: BodyInfo = {
  name: "Earth",
  aphelion: 152100,
  peribelion: 147095,
  semiMajorAxis: 149598.023,
  avatar: "/nineplanets-org/earth.png",
  map: "/maps/earth-4096x2048.jpg",
  color: composeColors(COLORS.blue, COLORS.green, COLORS.white),
  mass: 5.97237,
  radius: 6.371,
  inclination: 7.155 * RAD_PER_DEGREE
}

export const Mars: BodyInfo = {
  name: "Mars",
  aphelion: 249200,
  peribelion: 206700,
  semiMajorAxis: 227939.2,
  avatar: "/nineplanets-org/mars.png",
  map: "/maps/mars-1024x512.jpg",
  color: composeColors(COLORS.red, COLORS.brown, COLORS.tan),
  mass: .64171,
  radius: 3.3895,
  inclination: 5.65 * RAD_PER_DEGREE
}

export const Jupiter: BodyInfo = {
  name: "Jupiter",
  aphelion: 816620,
  peribelion: 740520,
  semiMajorAxis: 778570,
  avatar: "/nineplanets-org/jupiter.png",
  map: "/maps/jupiter-1024x512.jpg",
  color: composeColors(COLORS.brown, COLORS.orange, COLORS.tan, COLORS.white),
  mass: 1.8982 * 1000,
  radius: 69.911,
  inclination: 6.09 * RAD_PER_DEGREE
}

export const Saturn: BodyInfo = {
  name: "Saturn",
  aphelion: 1514500,
  peribelion: 1352550,
  semiMajorAxis: 1433530,
  avatar: "/nineplanets-org/saturn.png",
  map: "/maps/saturn-1024x512.jpg",
  color: composeColors(COLORS.golden, COLORS.brown, COLORS.green, COLORS.blue),
  mass: 568.34,
  radius: 58.232,
  inclination: 5.51 * RAD_PER_DEGREE
}

export const Uranus: BodyInfo = {
  name: "Uranus",
  aphelion: 20.11 * AU,
  peribelion: 18.33 * AU,
  semiMajorAxis: 19.2184 * AU,
  avatar: "/nineplanets-org/uranus.png",
  map: "/maps/uranus-1024x512.jpg",
  color: composeColors(COLORS.blue, COLORS.green),
  mass: approximates(86.810, .013),
  radius: approximates(25362, 7) * .001,
  inclination: 6.48 * RAD_PER_DEGREE
}

export const Neptune: BodyInfo = {
  name: "Neptune",
  aphelion: 30.33 * AU,
  peribelion: 29.81 * AU,
  semiMajorAxis: 30.07 * AU,
  avatar: "/nineplanets-org/neptune.png",
  map: "/maps/neptune-1024x512.jpg",
  color: composeColors(COLORS.blue),
  mass: 102.413,
  radius: approximates(24.622, .019),
  inclination: 6.43 * RAD_PER_DEGREE
}

export const Pluto: BodyInfo = {
  name: "Pluto",
  aphelion: 49.305 * AU,
  peribelion: 29.658 * AU,
  semiMajorAxis: 39.482 * AU,
  avatar: "/nineplanets-org/pluto.png",
  map: "/maps/pluto-2048x1024.jpg",
  color: composeColors(COLORS.white),
  mass: approximates(1.303, .003) * .01, // (1.303±0.003)×1022
  radius: approximates(1188.3, .8) * .001,
  inclination: 11.88 * RAD_PER_DEGREE
}

export const Ceres: BodyInfo = {
  name: "Ceres",
  aphelion: 2.9796467093 * AU,
  peribelion: 2.5586835997 * AU,
  semiMajorAxis: 2.7691651545 * AU,
  avatar: "/nineplanets-org/ceres.png",
  map: "/maps/ceres-1024x512.jpg",
  color: composeColors(COLORS.white),
  mass: approximates(9.3835, .0001) * .0001,
  radius: .46973,
  inclination: 0 * RAD_PER_DEGREE
}

export const Eris: BodyInfo = {
  name: "Eris",
  aphelion: 97.457 * AU,
  peribelion: 38.271 * AU,
  semiMajorAxis: 67.864 * AU,
  avatar: "/nineplanets-org/eris.png",
  map: "/maps/eris-960x480.jpg",
  color: composeColors(COLORS.white),
  mass: approximates(1.6466, .0085) * .01,
  radius: approximates(1163, 6) * .001,
  inclination: 44.040 * RAD_PER_DEGREE
}

// Commets bellow

export const Halley: BodyInfo = {
  name: "Halley",
  aphelion: 35.082 * AU,
  peribelion: 0.586 * AU,
  semiMajorAxis: 17.834 * AU,
  avatar: "/nineplanets-org/ceres.png",
  map: "/maps/moon-1024x512.jpg",
  color: composeColors(COLORS.white),
  mass: 2.2 * Math.pow(10, -10),
  radius: 11 * .001,
  inclination: 0
}

export const Tempel1: BodyInfo = {
  name: "Tempel-1",
  aphelion: 4.748 * AU,
  peribelion: 1.542 * AU,
  semiMajorAxis: 3.145 * AU,
  avatar: "/nineplanets-org/PIA02142_Tempel_1_bottom_sharped.jpg",
  map: "/maps/moon-1024x512.jpg",
  color: composeColors(COLORS.white),
  mass: 2.2 * Math.pow(10, -10),
  radius: 5 * .001,
  inclination: 10.474 * RAD_PER_DEGREE
}

export const Holmes: BodyInfo = {
  name: "Holmes",
  aphelion: 5.183610 * AU,
  peribelion: 2.053218 * AU,
  semiMajorAxis: 3.618414 * AU,
  avatar: "/nineplanets-org/asteroid.png",
  map: "/maps/moon-1024x512.jpg",
  color: composeColors(COLORS.white),
  mass: 2.2 * Math.pow(10, -10),
  radius: 5 * .001,
  inclination: 19.1126 * RAD_PER_DEGREE
}

export const HaleBopp: BodyInfo = {
  name: "Hale-Bopp",
  aphelion: 370.8 * AU,
  peribelion: 0.914 * AU,
  semiMajorAxis: 186 * AU,
  avatar: "/nineplanets-org/asteroid.png",
  map: "/maps/moon-1024x512.jpg",
  color: composeColors(COLORS.white),
  mass: 2.2 * Math.pow(10, -10),
  radius: approximates(60, 20) * .001,
  inclination: 89.4 * RAD_PER_DEGREE
}

// natural satellites

export const Luna: BodyInfo = {
  name: "Luna",
  aphelion: 405.400,
  peribelion: 362.600,
  semiMajorAxis: 384.399,
  avatar: "/nineplanets-org/moon.png",
  map: "/maps/moon-1024x512.jpg",
  color: composeColors(COLORS.grey),
  mass: .07342,
  radius: 1.7374,
  inclination: 5.145 * RAD_PER_DEGREE,
  ref: Earth
}