; (function () {
  interface BodyInfo {
    coords: vec3
    velocity: vec3
    mass: number
  }

  importScripts("../env.js")
  importScripts(GLMATRIX_SCRIPT_URL)

  const GRAVITY_CONST = 6.67430 * 0.00001
  let UNIT_OF_TIME = 100000 // unit's second
  let LOOPS = 10
  const BUNDLE_SIZE = 1000 // mini seconds

  const {
    vec3,
    mat4
  } = glMatrix

  let data: Float32Array = null
  let dataView: DataView = null
  let bodyInfos: BodyInfo[] = null
  let N = 0

  const createBodyInf = (nums: number[]): BodyInfo => {
    return {
      coords: nums.slice(0, 3) as vec3,
      velocity: nums.slice(3, 6) as vec3,
      mass: nums[6]
    }
  }

  onmessage = ({ data: _data }) => {
    if (_data === "next") {
      computes()
      return
    }

    if (bodyInfos !== null) return

    bodyInfos = []
    let offset = 0
    data = _data
    dataView = new DataView(data.buffer)
    N = (data.length - 2) / 7

    LOOPS = 0 ^ dataView.getFloat32(offset)
    offset += 4
    UNIT_OF_TIME = 0 ^ dataView.getFloat32(offset)
    offset += 4

    for (let c = 0; c < N; c += 1) {
      const nums: number[] = []
      for (let i = 0; i < 7; i++) {
        nums.push(dataView.getFloat32(offset))
        offset += 4
      }
      bodyInfos.push(createBodyInf(nums))
    }

    computes()
  }

  const computes = () => {
    const startTime = performance.now()
    const bundle = new Float32Array(bodyInfos.length * 6 * BUNDLE_SIZE)
    const writer = new DataView(bundle.buffer)
    let n = BUNDLE_SIZE
    let offset = 0
    while (n--) {
      for (let b of bodyInfos) {
        let t = LOOPS
        while (t--) {
          move(b)
        }
        const data = [...b.coords, ...b.velocity]
        for (let i = 0; i < 6; i++) {
          writer.setFloat32(offset, data[i])
          offset += 4
        }
      }
    }
    console.log(`takes ${(performance.now() - startTime).toFixed(3)}ms`, bundle.byteLength)
    postMessage(bundle)
  }

  const computesFieldIntensityFromBody = (target: BodyInfo, from: BodyInfo) => {
    const r = vec3.distance(
      target.coords,
      from.coords
    )
    const g = (GRAVITY_CONST * from.mass) / (r * r)
    const vec = vec3.create()
    vec3.subtract(
      vec,
      from.coords,
      target.coords
    )
    vec3.normalize(vec, vec)
    const fi = vec3.scale(vec, vec, g)
    return fi
  }

  const computesFieldIntensity = (target: BodyInfo) => {
    const fi = vec3.create()
    for (const from of bodyInfos) {
      if (from === target) continue
      vec3.add(
        fi,
        fi,
        computesFieldIntensityFromBody(target, from)
      )
    }
    return fi
  }

  const move = (b: BodyInfo) => {
    const ds = vec3.scale(
      [0, 0, 0],
      b.velocity,
      UNIT_OF_TIME
    )

    const fi = computesFieldIntensity(b)

    const dv = vec3.scale(
      [0, 0, 0],
      fi,
      UNIT_OF_TIME
    )
    // velocity changes
    vec3.add(
      b.velocity,
      b.velocity,
      dv
    )

    const ds1 = vec3.scale(
      [0, 0, 0],
      dv,
      .5 * UNIT_OF_TIME
    )

    vec3.add(
      ds,
      ds,
      ds1
    )

    vec3.add(
      b.coords,
      b.coords,
      ds
    )
  }
}())