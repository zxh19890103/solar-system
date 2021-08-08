import { K_8K_STARS_JPG, K_8K_STARS_MILKY_WAY_JPG } from "../planets-inf/images";
import { AU } from "../sys/constants";

export const CAMERA_POSITION_Y = 2 * AU
export const G = 6.67 * .00001 // be sure the velocity's unit is km/s
export const BUFFER_SIZE = 10
export const MOMENT = 100 // s

export const PERSPECTIVE_VIEW_FIELD = 120

/**
 * seconds
 */
export const BUFFER_MOMENT = BUFFER_SIZE * MOMENT
export const SECONDS_IN_HOUR = 60 * 60
export const ZERO_ACC = [0, 0, 0]
export const SKY_BG = K_8K_STARS_MILKY_WAY_JPG