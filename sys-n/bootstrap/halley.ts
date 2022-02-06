import * as THREE from "three"
import { CelestialBody, setVec3RelativeTo } from "../gravity"
import {
  FAR_OF_CAMERA,
  system,
  initializeSystem,
  setSystemsActive,
  setSystemOptions,
  serializeSys,
} from "./solar-data"
import { BUFFER_SIZE, CAMERA_POSITION_Y, MOMENT } from "../settings"
import { makeCameraEditable } from "../editor"
import { AU } from "../../sys/constants"
import { path, point, sphere, tail } from "../providers"
import * as images from "../../planets-inf/images"
import { BOOTSTRAP_STATE, toThreeJSCSMat } from "../jpl-data"
import { ParticleSystem } from "../particle/System"

const bootstrap = (
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  camera: THREE.Camera
) => {
  setSystemOptions(
    {
      name: "Tempel1",
      provider: point,
      tail: true,
      path: true,
      hidden: false,
    },
    "Sun"
  )

  initializeSystem(system, null)

  const star = system.celestialBody
  star.init(scene)

  const particleSys = new ParticleSystem(star.o3)

  const halley = star.find("Tempel1")
  const update = CelestialBody.createUniNextFn(star, true)

  const sunLight = new THREE.PointLight(0xffffff, 1)
  sunLight.position.set(0, 0, 0)
  scene.add(sunLight)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)

  // const cameraWhere = halley.position.clone()
  // cameraWhere.x += .1 * AU

  camera.up.set(0, 1, 0)
  camera.position.set(0, 6 * AU, 0)
  camera.lookAt(0, 0, 0)

  particleSys.makeComets(halley)

  ;(async () => {
    await fetch("/compution-buffer", {
      method: "POST",
      body: JSON.stringify({ B: BUFFER_SIZE, M: MOMENT, N: 80 }),
    })
    await fetch("/compution-init", {
      method: "POST",
      body: JSON.stringify(serializeSys(system)),
    })
  })()

  const objects = star.flat()
  const records = []
  let ing = false

  const nextTick = () => {
    const record = records.shift()
    if (!record) {
      ing = false
      return
    }

    for (const co of objects) {
      const [vx, vy, vz, px, py, pz] = record[co.info.name]
      co.velocityArr[0] = vx
      co.velocityArr[1] = vy
      co.velocityArr[2] = vz
      co.positionArr[0] = px
      co.positionArr[1] = py
      co.positionArr[2] = pz
    }

    update()
    particleSys.update()
    // camera.lookAt(halley.position)
    renderer.render(scene, camera)
    requestAnimationFrame(nextTick)
  }

  computionResultJsonp((data) => {
    records.push(...data)
    if (ing) return
    ing = true
    nextTick()
  })
}

export default bootstrap
export { bootstrap }
