import { BodyInfo } from "../sys/body-info"
import { AU } from "../sys/constants"

const G = 6.67 * .1

export class CelestialBody {
  o3: THREE.Object3D
  info: BodyInfo
  velocity: THREE.Vector3
  position: THREE.Vector3
  orbitalAxis: THREE.Vector3

  inclinationMat: THREE.Matrix4

  ref: CelestialBody = null
  force: THREE.Vector3

  history: number[] = []
  updateFn: (positions: number[]) => void

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
  }

  private computeFieldForce() {
    const { ref, info } = this
    const r = this.position.distanceToSquared(ref.position)
    const scalar = G * (info.mass * ref.info.mass) / r
    const rp = ref.position
    const p = this.position
    this.force = new THREE.Vector3(
      rp.x - p.x,
      rp.y - p.y,
      rp.z - p.z
    ).setLength(scalar)
  }

  public next() {
    const dt = 10
    const m = this.info.mass
    this.computeFieldForce() // force changes
    const dv = this.force.multiplyScalar(dt / m)
    const { x: vx, y: vy, z: vz } = this.velocity
    const { x: dvx, y: dvy, z: dvz } = dv
    const ds = new THREE.Vector3(
      vx * dt + .5 * dvx * dt,
      vy * dt + .5 * dvy * dt,
      vz * dt + .5 * dvz * dt,
    )
    this.velocity.add(dv) // velocity changes
    this.position.add(ds) // position changes

    // this.history.push(
    //   ...this.position.toArray()
    // )

    // if (this.updateFn) {
    //   this.updateFn(this.history)
    // }

    // sync mesh
    this.o3.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    )
  }

  private computeVelocityOnAphelion() {
    const { ref, semiMajorAxis, aphelion } = this.info
    const m = ref.mass
    const scalar = Math.sqrt(G * m * (2 / aphelion - 1 / semiMajorAxis))
    this.velocity = new THREE.Vector3(0, 0, scalar)
    this.velocity.applyMatrix4(this.inclinationMat)
  }
}