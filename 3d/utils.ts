export const approximates = (basis: number, approximation: number) => {
  return basis + (
    approximation * (1 - 2 * Math.random())
  )
}

export const range = (min: number, max: number) => {
  return min + Math.random() * (max - min)
}