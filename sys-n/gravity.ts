import { BodyInfo } from "../sys/body-info"
import { AU } from "../sys/constants"

const G = 6.67 * .00001

const div = document.createElement('div')
div.style.cssText = `
position: absolute;
top: 8px;
left: 8px;
color: #fff;
font-size: 14px;
z-index: 10;
width: 200px;
`
document.body.appendChild(div)

const insertCanvas = (info: BodyInfo) => {
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 60
  canvas.style.cssText = `width: 200px; height: 60px; position: static;`
  const ctx = canvas.getContext('2d')
  div.appendChild(canvas)
  const color = 'rgba(' + info.color.map(x => 0 ^ x * 255).join(',') + ')'
  ctx.strokeStyle = color
  ctx.textBaseline = 'top'
  const h = 12
  ctx.font = `${h}px / 1 Wawati SC`
  ctx.strokeText(info.name, 0, 0, 200)

  return {
    write: (txt: string, lineno = 1) => {
      ctx.clearRect(0, h * lineno, 200, h)
      ctx.strokeText(txt, 0, h * lineno, 200)
    }
  }
}


export class CelestialBody {
  o3: THREE.Object3D
  info: BodyInfo
  velocity: THREE.Vector3
  position: THREE.Vector3
  orbitalAxis: THREE.Vector3
  period: number = 0

  inclinationMat: THREE.Matrix4

  ref: CelestialBody = null
  force: THREE.Vector3

  history: number[] = []
  updateFn: () => void
  writer: { write: (txt: string, lineno?: number) => void }

  constructor(o3: THREE.Object3D, info: BodyInfo) {
    this.o3 = o3
    this.info = info

    this.position = new THREE.Vector3(0, 0, 0)
    this.velocity = new THREE.Vector3(0, 0, 0)
  }

  init() {

    const refPlane = new THREE.Vector3(1, 0, 1)
    this.orbitalAxis = new THREE.Vector3(0, 1, 0)
    const mat = new THREE.Matrix4()
    mat.makeRotationAxis(refPlane, this.info.inclination)
    this.orbitalAxis.applyMatrix4(mat)

    this.inclinationMat = mat

    this.position = new THREE.Vector3(this.info.aphelion, 0, 0)
    this.position.applyMatrix4(mat)

    this.computeVelocityOnAphelion()
    this.period = this.computePeriod()

    this.writer = insertCanvas(this.info)
  }

  private computeFieldForceByRef(position0: [number, number, number], position: THREE.Vector3, mass0: number, mass: number) {
    const [x, y, z] = position0
    const { x: rx, y: ry, z: rz } = position
    const r2 = (
      (x - rx) * (x - rx) +
      (y - ry) * (y - ry) +
      (z - rz) * (z - rz)
    )

    const scalar = G * (mass0 * mass) / r2

    const dx = rx - x,
      dy = ry - y,
      dz = rz - z

    const dir = [dx, dy, dz]

    const length = Math.sqrt(dx * dx + dy * dy + dz * dz)

    return dir.map(com => scalar * com / length)
  }

  private buffer() {
    let n = 4000
    const dt = 100
    const m = this.info.mass
    const k = dt / m
    const v = this.velocity.clone().toArray()
    const p = this.position.clone().toArray()

    const arg0 = this.ref.position
    const arg1 = this.info.mass
    const arg2 = this.ref.info.mass

    const getForce = this.computeFieldForceByRef

    while (n--) {
      const force = getForce(
        p,
        arg0,
        arg1,
        arg2
      ) // force changes
      const dv = force.map(c => c * k)
      const [vx, vy, vz] = v
      const [dvx, dvy, dvz] = dv
      const ds = [
        vx * dt + .5 * dvx * dt,
        vy * dt + .5 * dvy * dt,
        vz * dt + .5 * dvz * dt,
      ]

      v[0] += dv[0]
      v[1] += dv[1]
      v[2] += dv[2]

      p[0] += ds[0]
      p[1] += ds[1]
      p[2] += ds[2]
    }

    this.velocity.set(...v) // velocity changes
    this.position.set(...p)// position changes
  }

  public next() {
    this.buffer()
    // sync mesh
    this.o3.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    )

    const distance = this.position.length() / AU
    this.writer.write(`distance: ${distance.toFixed(4)} AU`, 1)
    const speed = this.velocity.length() * 1000
    this.writer.write(`speed: ${speed.toFixed(2)} km/s`, 2)
    this.writer.write(`period: ${this.period.toFixed(2)} year(s)`, 3)
    // this.updateFn && this.updateFn()
  }

  i = 0
  useHistory: boolean = false

  private computeVelocityOnAphelion() {
    const { ref, semiMajorAxis, aphelion } = this.info
    const m = ref.mass
    const scalar = Math.sqrt(G * m * (2 / aphelion - 1 / semiMajorAxis))
    this.velocity = new THREE.Vector3(0, 0, scalar)
    this.velocity.applyMatrix4(this.inclinationMat)
  }

  private computePeriod() {
    // t2 = (4PI2 * a * 3) / GM
    const pipi = Math.PI ** 2
    const aaa = this.info.semiMajorAxis ** 3
    const M = this.ref.info.mass
    const K = 31567699.59
    return Math.sqrt(
      (4 * pipi * aaa) / (G * M)
    ) / K
  }
}