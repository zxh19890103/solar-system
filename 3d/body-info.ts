import { AU, RAD_PER_DEGREE } from "./constants"
import { approximates, parseColor, randColor, range } from "./utils"

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
  color: vec4
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
  ref?: BodyInfo,
  rings?: [string, number][],
  // d
  rotationPeriod?: number
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
  golden: [255, 215, 0],
  yellow: [247, 233, 54],
  black: [0, 0, 0]
}

const composeColors = (...colors: Array<number[]>): vec4 => {
  const color: vec4 = [0, 0, 0, 0]
  colors.forEach(
    (c, i) => {
      color[0] += c[0]
      color[1] += c[1]
      color[2] += c[2]
    })
  color.forEach((c, ix) => {
    color[ix] = color[ix] / 255
  })
  color[3] = 1
  return color
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
  inclination: 3.38 * RAD_PER_DEGREE,
  rotationPeriod: 58.646
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
  inclination: 3.86 * RAD_PER_DEGREE,
  rotationPeriod: -243.025
}

export const Earth: BodyInfo = {
  name: "Earth",
  aphelion: 152100,
  peribelion: 147095,
  semiMajorAxis: 149598.023,
  avatar: "/nineplanets-org/earth.png",
  map: "/maps/earth-1000x500.jpg",
  color: composeColors(COLORS.blue, COLORS.green),
  mass: 5.97237,
  radius: 6.371,
  inclination: 7.155 * RAD_PER_DEGREE,
  rotationPeriod: .99
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
  inclination: 5.65 * RAD_PER_DEGREE,
  rotationPeriod: 1.025957
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
  inclination: 6.09 * RAD_PER_DEGREE,
  rotationPeriod: 9.925 / 24
}

export const Saturn: BodyInfo = {
  name: "Saturn",
  aphelion: 1514500,
  peribelion: 1352550,
  semiMajorAxis: 1433530,
  avatar: "/nineplanets-org/saturn.png",
  map: "/maps/saturn-1024x512.jpg",
  color: parseColor("#e0cdbc"),
  mass: 568.34,
  radius: 58.232,
  inclination: 5.51 * RAD_PER_DEGREE,
  rotationPeriod: 10.5 / 24,
  /**
   * D Ring	66,900   –  74,510	7,500	
   * C Ring	74,658   –   92,000	17,500	
   * B Ring	92,000   –  117,580	25,500	
   * Cassini Division	117,580   –   122,170	4,700
   * A ring	122,170   –   136,775	14,600	
   * Roche Division	136,775   –   139,380	2,600
   * F Ring	140,180 (3)	30   –  500
   * 
   * total width: 73283
   */
  rings: [
    ['#000000', 66900],
    ['#1c1c1c', 74510],
    ['#000000', 74658],
    ['#5d564f', 92000],
    ['#aa9983', 117580],
    ['#4f4539', 122170],
    ['#292625', 136775],
    ['#c8b7a5', 139380],
    ['#000000', 140180],
    ['#fffbe7', 140580],
  ]
}

export const Uranus: BodyInfo = {
  name: "Uranus",
  aphelion: 20.11 * AU,
  peribelion: 18.33 * AU,
  semiMajorAxis: 19.2184 * AU,
  avatar: "/nineplanets-org/uranus.png",
  map: "/maps/uranus-1024x512.png",
  color: composeColors(COLORS.blue, COLORS.green),
  mass: approximates(86.810, .013),
  radius: approximates(25362, 7) * .001,
  inclination: 6.48 * RAD_PER_DEGREE,
  rotationPeriod: -17.2 / 24
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
  inclination: 6.43 * RAD_PER_DEGREE,
  rotationPeriod: 0.6713
}

export const Pluto: BodyInfo = {
  name: "Pluto",
  aphelion: 49.305 * AU,
  peribelion: 29.658 * AU,
  semiMajorAxis: 39.482 * AU,
  avatar: "/nineplanets-org/pluto.png",
  map: "/maps/pluto-2048x1024.jpg",
  color: randColor(),
  mass: approximates(1.303, .003) * .01, // (1.303±0.003)×1022
  radius: approximates(1188.3, .8) * .001,
  inclination: 11.88 * RAD_PER_DEGREE,
  rotationPeriod: 6.387230
}

export const Ceres: BodyInfo = {
  name: "Ceres",
  aphelion: 2.9796467093 * AU,
  peribelion: 2.5586835997 * AU,
  semiMajorAxis: 2.7691651545 * AU,
  avatar: "/nineplanets-org/ceres.png",
  map: "/maps/ceres-1024x512.jpg",
  color: randColor(),
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
  color: randColor(),
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
  color: composeColors(COLORS.orange),
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
  color: composeColors(COLORS.golden, COLORS.tan),
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
  color: composeColors(COLORS.white, COLORS.brown, COLORS.blue),
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
  color: composeColors(COLORS.grey, COLORS.brown, COLORS.red),
  mass: 2.2 * Math.pow(10, -10),
  radius: approximates(60, 20) * .001,
  inclination: 89.4 * RAD_PER_DEGREE
}

// natural satellites
// earth's
export const Luna: BodyInfo = {
  name: "Luna",
  aphelion: 405.400,
  peribelion: 362.600,
  semiMajorAxis: 384.399,
  avatar: "/nineplanets-org/moon.png",
  map: "/maps/moon-1024x512.jpg",
  color: randColor(),
  mass: .07342,
  radius: 1.7374,
  inclination: 0 * RAD_PER_DEGREE,
  ref: Earth,
  rotationPeriod: 27.321661
}

// juptier's
export const Lo: BodyInfo = {
  name: "Lo",
  aphelion: 423.400,
  peribelion: 420.000,
  semiMajorAxis: 421.700,
  avatar: "/nineplanets-org/1920px-lo_highest_resolution_true_color.jpg",
  map: "",
  color: composeColors(COLORS.yellow),
  mass: 8.931938 * .01, // 8.931938±0.000018
  radius: approximates(1821.6, .5) * .001, // 1821.6±0.5 km
  inclination: 0.05 * RAD_PER_DEGREE,
  ref: Jupiter
}

export const Europa: BodyInfo = {
  name: "Europa",
  aphelion: 676.938,
  peribelion: 664.862,
  semiMajorAxis: 670.900,
  avatar: "/nineplanets-org/Europa-moon-with-margins.jpg",
  map: "",
  color: composeColors(COLORS.tan),
  mass: 4.799844 * .01, // 	(4.799844±0.000013)×1022 kg
  radius: approximates(1560.8, .5) * .001, // 1560.8±0.5 km
  inclination: 0.470 * RAD_PER_DEGREE,
  ref: Jupiter
}

export const Ganymede: BodyInfo = {
  name: "Ganymede",
  aphelion: 1071.600,
  peribelion: 1069.200,
  semiMajorAxis: 1070.400,
  avatar: "/nineplanets-org/Ganymede_g1_true-edit1.jpg",
  map: "",
  color: composeColors(COLORS.grey, COLORS.white),
  mass: 1.4819 * .1, // 	1.4819×1023 kg 
  radius: approximates(2634.1, .3) * .001, // 2634.1±0.3 km
  inclination: 0.20 * RAD_PER_DEGREE,
  ref: Jupiter
}

export const Callisto: BodyInfo = {
  name: "Callisto",
  aphelion: 1897.000,
  peribelion: 1869.000,
  semiMajorAxis: 1882.700,
  avatar: "/nineplanets-org/Callisto.jpg",
  map: "",
  color: randColor(),
  mass: 1.075938 * .1, // (1.075938±0.000137)×1023 kg
  radius: approximates(2410.3, 1.5) * .001, // 2410.3±1.5 km 
  inclination: 2.017 * RAD_PER_DEGREE,
  ref: Jupiter
}

// saturn's
export const Titan: BodyInfo = {
  name: "Titan",
  aphelion: 1257.060,
  peribelion: 1186.680,
  semiMajorAxis: 1221.870,
  avatar: "/nineplanets-org/Titan_in_true_color.jpg",
  map: "",
  color: composeColors(COLORS.yellow),
  mass: 1.3452 * .1, // (1.3452±0.0002)×1023 kg
  radius: approximates(2574.73, .09) * .001, // 2574.73±0.09 km
  inclination: 0.34854 * RAD_PER_DEGREE,
  ref: Saturn
}

export const Rhea: BodyInfo = {
  name: "Rhea",
  aphelion: 527.108,
  peribelion: 527.108,
  semiMajorAxis: 527.108,
  avatar: "/nineplanets-org/1920px-PIA07763_Rhea_full_globe5.jpg",
  map: "",
  color: randColor(),
  mass: 2.306518 * .001, // 	(2.306518±0.000353)×1021 kg
  radius: approximates(763.8, 1) * .001, // 763.8±1.0 km 
  inclination: 0.345 * RAD_PER_DEGREE,
  ref: Saturn
}

export const Enceladus: BodyInfo = {
  name: "Enceladus",
  aphelion: 237.948,
  peribelion: 237.948,
  semiMajorAxis: 237.948,
  avatar: "/nineplanets-org/PIA17202_-_Approaching_Enceladus.jpg",
  map: "",
  color: composeColors(COLORS.grey, COLORS.blue, COLORS.red),
  mass: approximates(1.08022, 0.00101) * .0001, // 	(1.08022±0.00101)×1020 kg
  radius: approximates(252.1, 0.2) * .001, // 252.1±0.2 km 
  inclination: 0.009 * RAD_PER_DEGREE,
  ref: Saturn
}

export const Mimas: BodyInfo = {
  name: "Mimas",
  aphelion: 189.176,
  peribelion: 181.902,
  semiMajorAxis: 185.539,
  avatar: "/nineplanets-org/PIA17202_-_Approaching_Enceladus.jpg",
  map: "",
  color: composeColors(COLORS.green, COLORS.blue, COLORS.red),
  mass: 3.7493 * .00001,
  radius: .198, // 198.2±0.4 km
  inclination: 1.574 * RAD_PER_DEGREE,
  ref: Saturn
}

export const Tethys: BodyInfo = {
  name: "Tethys",
  aphelion: 294.619,
  peribelion: 294.619,
  semiMajorAxis: 294.619,
  avatar: "/nineplanets-org/PIA17202_-_Approaching_Enceladus.jpg",
  map: "",
  color: composeColors(COLORS.golden, COLORS.tan),
  mass: 6.17449 * .0001,
  radius: 531.1 * .001, // 531.1±0.6 km
  inclination: 1.574 * RAD_PER_DEGREE,
  ref: Saturn
}

export const Dione: BodyInfo = {
  name: "Dione",
  aphelion: 377.396,
  peribelion: 377.396,
  semiMajorAxis: 377.396,
  avatar: "/nineplanets-org/PIA17202_-_Approaching_Enceladus.jpg",
  map: "",
  color: composeColors(COLORS.black, COLORS.blue, COLORS.brown),
  mass: 1.095452 * .001, // (1.095452±0.000168)×1021 kg
  radius: 561.4 * .001, // 561.4±0.4 km
  inclination: 0.019 * RAD_PER_DEGREE,
  ref: Saturn
}

export const Iapetus: BodyInfo = {
  name: "Iapetus",
  aphelion: 3560.820,
  peribelion: 3560.820,
  semiMajorAxis: 3560.820,
  avatar: "/nineplanets-org/PIA17202_-_Approaching_Enceladus.jpg",
  map: "",
  color: composeColors(COLORS.orange, COLORS.blue, COLORS.brown),
  mass: 1.805635 * .001, // (1.805635±0.000375)×1021 kg
  radius: 734.5 * .001, // 734.5±2.8 km
  inclination: 15.47 * RAD_PER_DEGREE,
  ref: Saturn
}

// neptune's
/**
 * - Periapsis	117584±10 km
 * - Apoapsis	117709±10 km
 * - Semi-major axis	117647±1 km (4.75 RN)
 * - Mass 4.4×1019 kg
 * - Mean radius	210±7 km
 */
export const Proteus: BodyInfo = {
  name: "Proteus",
  aphelion: 117.584,
  peribelion: 117.709,
  semiMajorAxis: 117.647,
  avatar: "/nineplanets-org/Proteus_(Voyager_2).jpg",
  map: "",
  color: composeColors(COLORS.orange, COLORS.blue, COLORS.brown),
  mass: 4.4 * .00001,
  radius: 210 * .001,
  inclination: 0.524 * RAD_PER_DEGREE,
  ref: Neptune
}

/**
 * Semi-major axis	354,759 km
 * mass (2.1390±0.0028)×1022 kg
 * inclination 156.885
 * r:  ,353.4±0.9 km
 */
export const Triton: BodyInfo = {
  name: "Triton",
  aphelion: 354.759,
  peribelion: 354.759,
  semiMajorAxis: 354.759,
  avatar: "/nineplanets-org/1024px-Triton_moon_mosaic_Voyager_2_(large).jpg",
  map: "",
  color: composeColors(COLORS.orange, COLORS.brown, COLORS.brown),
  mass: approximates(2.1390, 0.0028) * .01,
  radius: approximates(353.4, 0.9) * .001,
  inclination: 156.885 * RAD_PER_DEGREE,
  ref: Neptune
}

/**
 * sma 5,513,940 km
 * r: 357±13 km / 2
 */
export const Nereid: BodyInfo = {
  name: "Nereid",
  aphelion: 5513.940 * 1.4,
  peribelion: 5513.940 * .3,
  semiMajorAxis: 5513.940,
  avatar: "/nineplanets-org/Nereid-Voyager2.jpg",
  map: "",
  color: composeColors(COLORS.golden, COLORS.red),
  mass: approximates(2.1390, 0.0028) * .01,
  radius: approximates(357, 13) / 2 * .001,
  inclination: 0 * RAD_PER_DEGREE,
  ref: Neptune
}

export const Bodies13 = {
  Sun,
  Mercury,
  Venus,
  Earth,
  Luna,
  Mars,
  Jupiter,
  Saturn,
  Uranus,
  Neptune,
  Ceres,
  Eris,
  Pluto
}