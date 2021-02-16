const POINT_STRUCT = [0, 1]

const { PI, random } = Math

export const computeAngleBy2Points = (from: universe.Point, to: universe.Point) => {
  const [x, y] = POINT_STRUCT.map(i => to[i] - from[i])
  if (x === 0 && y === 0) {
    return 0
  }
  const angle = Math.atan(y / x)
  if (x > 0) return angle
  else return PI + angle
}

export const rand = (min, max) => {
  return min + random() * (max - min)
}