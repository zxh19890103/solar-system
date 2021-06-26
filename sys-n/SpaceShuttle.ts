import { Object3D } from "three";
import { BodyInfo } from "../sys/body-info";
import { CelestialBody, computeAccBy } from "./gravity";

export class SpaceShuttle {
  mass: number
  color: '#fff'

  ref: CelestialBody
  o3: Object3D

  readonly velocity: THREE.Vector3

  acc: THREE.Vector3

  emit() {
    const { x, y, z } = this.acc
    this.acc.set(x + .001, y + .003, z + .4)
  }

  createNextFn() {
    const { o3, ref, acc, velocity } = this
    return () => {
      const a = computeAccBy([0, 0, 0], [0, 0, 0], 0, 0)
    }
  }
}