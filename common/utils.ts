export const randColor = (basis?: vec4): vec4 => {
  if (basis) {
    const r = Math.random()
    const color = basis.map(x => x * r)
    color[3] = 1
    return color as vec4
  }
  return Array(4)
    .fill(0)
    .map(Math.random) as vec4
}

export const parseColor = (color: string): vec4 => {
  // validates
  if (!/^#[a-z0-9]{6}$/.test(color)) {
    throw new Error(`${color} is not a valid color`)
  }
  const [, r, g, b] = /^#(\w\w)(\w\w)(\w\w)$/.exec(color)
  return [r, g, b, 'ff'].map((c, i) => {
    return parseInt(c, 16) / 255
  }) as vec4
}

export const isPowerOfTwo = (num: number) => {
  return 0 === ((num - 1) & num)
}
