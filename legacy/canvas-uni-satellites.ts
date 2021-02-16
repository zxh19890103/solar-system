import { BodyInfo } from "./canvas-uni-8"
import { RAD_PER_DEGREE } from "./canvas-uni-constants"

export const Luna: BodyInfo = {
  name: "Luna",
  aphelion: 405.400,
  peribelion: 362.600,
  semiMajorAxis: 384.399,
  avatar: "/nineplanets-org/moon.png",
  color: "grey",
  mass: .07342,
  radius: 1.7374,
  inclination: 5.145 * RAD_PER_DEGREE
}

export const Lo: BodyInfo = {
  name: "Lo",
  aphelion: 423.400,
  peribelion: 420.000,
  semiMajorAxis: 421.700,
  avatar: "/nineplanets-org/1920px-lo_highest_resolution_true_color.jpg",
  color: "yellow",
  mass: 8.931938 * .01, // 8.931938±0.000018
  radius: 1.8216, // 1821.6±0.5 km
  inclination: 0.05 * RAD_PER_DEGREE
}

export const Europa: BodyInfo = {
  name: "Europa",
  aphelion: 676.938,
  peribelion: 664.862,
  semiMajorAxis: 670.900,
  avatar: "/nineplanets-org/Europa-moon-with-margins.jpg",
  color: "purple",
  mass: 4.799844 * .01, // 	(4.799844±0.000013)×1022 kg
  radius: 1.5608, // 1560.8±0.5 km
  inclination: 0.470 * RAD_PER_DEGREE
}

export const Ganymede: BodyInfo = {
  name: "Ganymede",
  aphelion: 1071.600,
  peribelion: 1069.200,
  semiMajorAxis: 1070.400,
  avatar: "/nineplanets-org/Ganymede_g1_true-edit1.jpg",
  color: "orange",
  mass: 1.4819 * .1, // 	1.4819×1023 kg 
  radius: 2.6341, // 2634.1±0.3 km
  inclination: 0.20 * RAD_PER_DEGREE
}

export const Callisto: BodyInfo = {
  name: "Callisto",
  aphelion: 1897.000,
  peribelion: 1869.000,
  semiMajorAxis: 1882.700,
  avatar: "/nineplanets-org/Callisto.jpg",
  color: "skyblue",
  mass: 1.075938 * .1, // (1.075938±0.000137)×1023 kg
  radius: 2.4103, // 2410.3±1.5 km 
  inclination: 2.017 * RAD_PER_DEGREE
}

export const Titan: BodyInfo = {
  name: "Titan",
  aphelion: 1257.060,
  peribelion: 1186.680,
  semiMajorAxis: 1221.870,
  avatar: "/nineplanets-org/Titan_in_true_color.jpg",
  color: "skyblue",
  mass: 1.3452 * .1, // (1.3452±0.0002)×1023 kg
  radius: 2.57473, // 2574.73±0.09 km
  inclination: 0.34854 * RAD_PER_DEGREE
}

export const Rhea: BodyInfo = {
  name: "Rhea",
  aphelion: 527.108,
  peribelion: 527.108,
  semiMajorAxis: 527.108,
  avatar: "/nineplanets-org/1920px-PIA07763_Rhea_full_globe5.jpg",
  color: "skyblue",
  mass: 2.306518 * .001, // 	(2.306518±0.000353)×1021 kg
  radius: .7638, // 763.8±1.0 km 
  inclination: 0.345 * RAD_PER_DEGREE
}