import { BodyInfo } from "./canvas-uni-8";
import { AU, RAD_PER_DEGREE } from "./canvas-uni-constants";
import { rand } from "./canvas-uni-utils";

export const Halley: BodyInfo = {
  name: "Halley",
  aphelion: 35.082 * AU,
  peribelion: 0.586 * AU,
  semiMajorAxis: 17.834 * AU,
  avatar: "/nineplanets-org/ceres.png",
  color: "white",
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
  color: "white",
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
  color: "white",
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
  color: "yellow",
  mass: 2.2 * Math.pow(10, -10),
  radius: rand(40, 80) * .001,
  inclination: 89.4 * RAD_PER_DEGREE
}