import { AU } from "../sys/constants";

export const CAMERA_POSITION_Y = 1.6 * AU
export const G = 6.67 * .00001 // be sure the velocity's unit is km/s
export const BUFFER_SIZE = 300
export const MOMENT = 100 // s

/**
 * seconds
 */
export const BUFFER_MOMENT = BUFFER_SIZE * MOMENT
export const SECONDS_IN_HOUR = 60 * 60
export const ZERO_ACC = [0, 0, 0]