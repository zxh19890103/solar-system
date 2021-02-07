export const approximates = (basis: number, approximation: number) => {
  return basis + (
    approximation * (1 - 2 * Math.random())
  )
}

export const range = (min: number, max: number) => {
  return min + Math.random() * (max - min)
}

export const parseColor = (color: string): Iterable<number> => {
  // validates
  if (!/^#[a-z0-9]{6}$/.test(color)) {
    throw new Error(`${color} is not a valid color`)
  }
  const [, r, g, b] = /^#(\w\w)(\w\w)(\w\w)$/.exec(color)
  return [r, g, b, 'ff'].map((c, i) => {
    return parseInt(c, 16) / 256
  })
}