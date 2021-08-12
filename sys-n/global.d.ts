import { Object3D } from "three"
import { BodyInfo } from "../sys/body-info"
import { CelestialBody } from "./gravity"
declare global {
  export interface CelestialSystem {
    body: BodyInfo
    hidden?: boolean
    moon?: boolean
    path?: boolean
    tail?: boolean
    rotates?: boolean
    provider?: (info: BodyInfo) => Object3D
    bootstrapState?: { velo: THREE.Vector3Tuple, posi: THREE.Vector3Tuple }
    celestialBody?: CelestialBody
    subSystems?: Array<CelestialSystem | BodyInfo>
  }

  export interface AppBoot {
    (scene: THREE.Scene, renderer: THREE.Renderer, camera: THREE.Camera): void
  }

  export function computionResultJsonp(fn: (d: any) => void)
}