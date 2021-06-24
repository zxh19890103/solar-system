import * as t from "three"
import { BodyInfo } from "../sys/body-info"
import { CelestialBody } from "./gravity"
declare global {
  export var THREE: typeof t
  export interface CelestialSystem {
    body: BodyInfo,
    celestialBody?: CelestialBody
    subSystems?: Array<CelestialSystem>
  }
}