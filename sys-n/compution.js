/**
 * @typedef {Object} CObj
 * @property {string} CObj.n
 * @property {number} CObj.m
 * @property {number} CObj.r
 * @property {number} CObj.vx
 * @property {number} CObj.vy
 * @property {number} CObj.vz
 * @property {number} CObj.px
 * @property {number} CObj.py
 * @property {number} CObj.pz
 * @property {CObj[]} CObj.oo
 * 
 * @typedef {Object} CObj2
 * @property {THREE.Vector3Tuple} CObj2.v
 * @property {THREE.Vector3Tuple} CObj2.p
 * @property {number} CObj2.m
 * @property {number} CObj2.r
 * @property {string} CObj2.n
 * @property {CObj2[]} CObj2.children
 */

/**
 * @type {number}
 */
const N = 100
const MOMENT = 100
const G = 6.67 * .00001
const ZERO_ACC = [0, 0, 0]

/**
 * @type {CObj2}
 */
let data = null
/**
 * @type {CObj2[]}
 */
let flatdata = null
/**
 * @type {Map<CObj2, CObj2[]>}
 */
const others = new Map()
/**
 * @param {CObj} raw 
 */
function receive(raw) {
  /**
   * @param {CObj} ro 
   * @param {CObj2} cur 
   */
  const loop = (ro, cur) => {
    cur.v = [ro.vx, ro.vy, ro.vz]
    cur.p = [ro.px, ro.py, ro.pz]
    cur.m = ro.m
    cur.n = ro.n
    flatdata.push(cur)
    if (ro.oo) {
      ro.oo.forEach((sro) => {
        const scur = {}
        loop(sro, scur)
      })
    }
  }

  data = {}
  flatdata = []
  loop(raw, data)
  for (let i of flatdata) {
    others.set(i, flatdata.filter(x => x !== i))
  }
}

/**
 * @param {THREE.Vector3Tuple} position 
 * @param {THREE.Vector3Tuple} velocity 
 * @param {CObj2} obj 
 */
function buffer(obj) {
  let n = N
  const posiArr = obj.p
  const veloArr = obj.v

  while (n--) {
    const a = computeAccOfCelestialBody(obj)
    const dv = [
      a[0] * MOMENT,
      a[1] * MOMENT,
      a[2] * MOMENT
    ]
    const [vx, vy, vz] = veloArr
    const [dvx, dvy, dvz] = dv
    const ds = [
      vx * MOMENT + 0.5 * dvx * MOMENT,
      vy * MOMENT + 0.5 * dvy * MOMENT,
      vz * MOMENT + 0.5 * dvz * MOMENT,
    ]

    veloArr[0] += dv[0]
    veloArr[1] += dv[1]
    veloArr[2] += dv[2]

    posiArr[0] += ds[0]
    posiArr[1] += ds[1]
    posiArr[2] += ds[2]
  }
}

/**
 * 
 * @param {THREE.Vector3Tuple} position0 
 * @param {THREE.Vector3Tuple} position 
 * @param {number} mass 
 * @param {number} radius 
 * @returns {THREE.Vector3Tuple}
 */
function computeAccBy(
  position0,
  position,
  mass,
  radius
) {

  if (mass === 0) return ZERO_ACC

  const [x, y, z] = position0
  const [rx, ry, rz] = position
  const dx = rx - x,
    dy = ry - y,
    dz = rz - z
  const r2 = (dx) * (dx) + (dy) * (dy) + (dz) * (dz)
  const length = Math.sqrt(r2)

  if (radius > length) return ZERO_ACC

  const scalar = (G * mass) / r2
  const factor = scalar / length
  return [dx * factor, dy * factor, dz * factor]
}

/**
 * 
 * @param {CObj2} self 
 * @returns {THREE.Vector3Tuple}
 */
function computeAccOfCelestialBody(self) {
  const sum = [0, 0, 0]
  const pos = self.p
  const objects = others.get(self)
  for (const obj of objects) {
    const a = computeAccBy(pos, obj.p, obj.m, obj.r)
    sum[0] += a[0]
    sum[1] += a[1]
    sum[2] += a[2]
  }
  return sum
}

function compute() {
  for (let obj of flatdata) {
    buffer(obj)
  }
  const map = Object.fromEntries(flatdata.map(d => {
    return [
      d.n,
      [...d.v, ...d.p]
    ]
  }))
  return JSON.stringify(map)
}

module.exports = {
  receive,
  compute
}