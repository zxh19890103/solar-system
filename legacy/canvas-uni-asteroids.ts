import { BodyInfo } from "./canvas-uni-8"
import { AU, RAD_PER_DEGREE } from "./canvas-uni-constants"

export const Apophis: BodyInfo = {
  name: "99942 Apophis",
  aphelion: 1.09851 * AU,
  peribelion: 0.74607 * AU,
  semiMajorAxis: 0.92244 * AU,
  avatar: "/nineplanets-org/asteroid.png",
  color: "white",
  mass: 6.1 * Math.pow(10, -14),
  radius: 0.185 * Math.pow(10, -3),
  inclination: 3.33137 * RAD_PER_DEGREE
}