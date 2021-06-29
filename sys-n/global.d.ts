import * as t from "three"
import { BodyInfo } from "../sys/body-info"
import { CelestialBody } from "./gravity"
declare global {
  export var THREE: typeof t
  export interface CelestialSystem {
    body: BodyInfo
    hidden?: boolean
    initialPosition?: THREE.Vector3
    initialVelocity?: THREE.Vector3
    celestialBody?: CelestialBody
    subSystems?: Array<CelestialSystem | BodyInfo>
  }

  export interface AppBoot {
    (scene: THREE.Scene, renderer: THREE.Renderer, camera: THREE.Camera): void
  }
}