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
  color: string
  /**
   * image url relative to path ./planets-inf
   */
  avatar: string
  map: string
  /**
   * to the Sun's equator;
   */
  inclination?: number,
  /**
   * the reference system.
   * default is the the solar
   */
  ref?: BodyInfo
}

export const Sun: BodyInfo = {
  name: "Sun",
  aphelion: 0,
  peribelion: 0,
  semiMajorAxis: 0,
  avatar: "/nineplanets-org/sun.png",
  map: "/nineplanets-org/sun.png",
  color: "#e74c0e",
  mass: 1.9885 * 1000000,
  radius: 696.342,
  inclination: 0
}

export const Earth: BodyInfo = {
  name: "Earth",
  aphelion: 152100,
  peribelion: 147095,
  semiMajorAxis: 149598.023,
  avatar: "/nineplanets-org/earth.png",
  map: "/maps/earthmap1k.jpg",
  color: "skyblue",
  mass: 5.97237,
  radius: 6.371,
  inclination: 7.155 * RAD_PER_DEGREE
}

export const Venus: BodyInfo = {
  name: "Venus",
  aphelion: 108939,
  peribelion: 107477,
  semiMajorAxis: 108208,
  avatar: "/nineplanets-org/venus.png",
  map: "/maps/venusmap.jpg",
  color: "skyblue",
  mass: 4.8675,
  radius: 6.0518,
  inclination: 3.86 * RAD_PER_DEGREE
}

export const Mars: BodyInfo = {
  name: "Mars",
  aphelion: 249200,
  peribelion: 206700,
  semiMajorAxis: 227939.2,
  avatar: "/nineplanets-org/mars.png",
  map: "/maps/mars_1k_color.jpg",
  color: "orange",
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
  map: "/maps/jupitermap.jpg",
  color: "skyblue",
  mass: 1.8982 * 1000,
  radius: 69.911,
  inclination: 6.09 * RAD_PER_DEGREE
}

export const Mercury: BodyInfo = {
  name: "Mercury",
  aphelion: 69816.900,
  peribelion: 46001.200,
  semiMajorAxis: 57909.050,
  avatar: "/nineplanets-org/mercury.png",
  map: "/maps/merc_diff.jpg",
  color: "white",
  mass: .33011,
  radius: 2.4397,
  inclination: 3.38 * RAD_PER_DEGREE
}

export const Saturn: BodyInfo = {
  name: "Saturn",
  aphelion: 1514500,
  peribelion: 1352550,
  semiMajorAxis: 1433530,
  avatar: "/nineplanets-org/saturn.png",
  map: "/maps/saturnmap.jpg",
  color: "white",
  mass: 568.34,
  radius: 58.232,
  inclination: 5.51 * RAD_PER_DEGREE
}

export const Neptune: BodyInfo = {
  name: "Neptune",
  aphelion: 30.33 * AU,
  peribelion: 29.81 * AU,
  semiMajorAxis: 30.07 * AU,
  avatar: "/nineplanets-org/neptune.png",
  map: "/maps/Neptune1.jpg",
  color: "white",
  mass: 102.413,
  radius: approximates(24.622, .019),
  inclination: 6.43 * RAD_PER_DEGREE
}

export const Uranus: BodyInfo = {
  name: "Uranus",
  aphelion: 20.11 * AU,
  peribelion: 18.33 * AU,
  semiMajorAxis: 19.2184 * AU,
  avatar: "/nineplanets-org/uranus.png",
  map: "/maps/uranusmap.jpg",
  color: "white",
  mass: approximates(86.810, .013),
  radius: approximates(25362, 7) * .001,
  inclination: 6.48 * RAD_PER_DEGREE
}

export const Pluto: BodyInfo = {
  name: "Pluto",
  aphelion: 49.305 * AU,
  peribelion: 29.658 * AU,
  semiMajorAxis: 39.482 * AU,
  avatar: "/nineplanets-org/pluto.png",
  map: "/maps/earthmap1k.jpg",
  color: "white",
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
  map: "/maps/earthmap1k.jpg",
  color: "white",
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
  map: "/maps/earthmap1k.jpg",
  color: "white",
  mass: approximates(1.6466, .0085) * .01,
  radius: approximates(1163, 6) * .001,
  inclination: 44.040 * RAD_PER_DEGREE
}