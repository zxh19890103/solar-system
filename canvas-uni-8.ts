import { AU, RAD_PER_DEGREE } from "./canvas-uni-constants"
import { rand } from "./canvas-uni-utils"

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
   * use the fake size to display a body more
   * visible.
   */
  dispayRadiusTimes?: number
  /**
   * size the planet would always be drawed on canvas.
   * unit: pixel.
   * if you not specifing it, we will use radius for drawing.
   */
  sizeInPixels?: number
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
  /**
   * if true, we will keep the body stick.
   * no render for him.
   */
  stick?: boolean
  /**
   * to the Sun's equator;
   */
  inclination?: number,
  index?: number,
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
  color: "#e74c0e",
  mass: 1.9885 * 1000000,
  radius: 696.342,
  stick: true,
  inclination: 0
}

export const Earth: BodyInfo = {
  name: "Earth",
  aphelion: 152100,
  peribelion: 147095,
  semiMajorAxis: 149598.023,
  avatar: "/nineplanets-org/earth.png",
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
  color: "white",
  mass: 102.413,
  radius: (24622 + rand(-19, 19)) * .001,
  inclination: 6.43 * RAD_PER_DEGREE
}

export const Uranus: BodyInfo = {
  name: "Uranus",
  aphelion: 20.11 * AU,
  peribelion: 18.33 * AU,
  semiMajorAxis: 19.2184 * AU,
  avatar: "/nineplanets-org/uranus.png",
  color: "white",
  mass: 86.810 + rand(-.013, .013),
  radius: (25362 + rand(-7, 7)) * .001,
  inclination: 6.48 * RAD_PER_DEGREE
}

export const Pluto: BodyInfo = {
  name: "Pluto",
  aphelion: 49.305 * AU,
  peribelion: 29.658 * AU,
  semiMajorAxis: 39.482 * AU,
  avatar: "/nineplanets-org/pluto.png",
  color: "white",
  mass: (1.303 + rand(-.003, .003)) * .01, // (1.303±0.003)×1022
  radius: (1188.3 + rand(-.8, .8)) * .001,
  inclination: 11.88 * RAD_PER_DEGREE
}
