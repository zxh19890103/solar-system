/**
 * astronomical unit 
 * unit: x10^3 km
 */
export const AU = 149597.8707

export const DAYS_OF_EARTH_YEAR = 365.25
export const SECONDS_IN_A_DAY = 24 * 60 * 60

// km / s
export const UNIT_OF_TIME = 5 // s
// 1 / 60s = RENDER_PERIOD * UNIT_OF_TIME s
//  1s = 60 * RENDER_PERIOD * UNIT_OF_TIME s
export const RENDER_PERIOD = 600
export const MIN_INTENSITY = 0
export const DAYS_PER_SECOND = RENDER_PERIOD * UNIT_OF_TIME / (60 * 24)
/**
 * It's 66.7430
 * plus 12
 */
export const GRAVITY_CONST = 6.67430 * Math.pow(10, 1)
/**
 * minus 24
 * unit: x 10 ^ 24 kg
 */
export const MASS_OF_SUN = 1.9885 * Math.pow(10, 6)

/**
 * 10 is more real.
 */
export const BODY_SIZE_COEFFICIENT = 10
/**
 * UNIT: PIXEL^2
 */
export const CANVAS_FILL_PRECISION = 0

export const RAD_PER_DEGREE = Math.PI / 180

/**
 * X10^3 KM
 */
export const ZINDE_RESOLUTION = 10.600