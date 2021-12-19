import * as THREE from 'three'
import { CelestialBody, setVec3RelativeTo } from "../gravity"
import { FAR_OF_CAMERA, system, initializeSystem, setSystemsActive, setSystemOptions, serializeSys } from './solar-data'
import { BUFFER_SIZE, CAMERA_POSITION_Y, MOMENT } from '../settings'
import { makeCameraEditable } from '../editor'
import { AU } from '../../sys/constants'
import { path, point, sphere } from '../providers'
import * as images from "../../planets-inf/images";
import { BOOTSTRAP_STATE, toThreeJSCSMat } from '../jpl-data'

const bootstrap = (scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.Camera) => {

  setSystemOptions(
    { name: 'Mercury', provider: sphere, path: false, rotates: true },
    { name: 'Venus', provider: sphere, path: false, rotates: true },
    { name: 'Earth', provider: sphere,  path: false, rotates: true },
    { name: 'Luna', provider: sphere,  path: false, rotates: true },
    { name: 'Mars', provider: sphere, path: false, rotates: true, },
    // { name: 'Pluto', provider: point, path: true },
    // { name: 'Halley', provider: point, path: true },
    // { name: 'Holmes', provider: point, path: true },
    // { name: 'HaleBopp', provider: point, path: true },
    // { name: 'Jupiter', provider: sphere, path: false, rotates: true },
    // { name: 'Saturn', provider: sphere, path: false, rotates: true },
    // { name: 'Uranus', provider: sphere, path: false, rotates: true },
    // { name: 'Neptune', provider: sphere, path: false, rotates: true },
    { name: 'Sun', provider: point, rotates: false })

  initializeSystem(system, null)

  const star = system.celestialBody
  star.init(scene)
  const earth = star.find('Earth');
  const next = CelestialBody.createUniNextFn(star, true)

  const sunLight = new THREE.PointLight(0xffffff, 1)
  sunLight.position.set(0, 0, 0)
  scene.add(sunLight)
  const ambientLight = new THREE.AmbientLight(0xffffff, .3)
  scene.add(ambientLight)

  // put camera on the position on line.
  // const cameraWhere = new THREE.Vector3(...BOOTSTRAP_STATE.Mercury.posi).applyMatrix4(toThreeJSCSMat)
  // cameraWhere.normalize()
  // cameraWhere.setLength(AU)
  const cameraWhere = new THREE.Vector3(0, 0 * AU, 1 * AU);

  camera.up.set(0, 1, 0)
  camera.position.copy(cameraWhere)
  camera.lookAt(0, 0, 0);

  (async () => {
    await fetch('/compution-buffer', { method: 'POST', body: JSON.stringify({ B: BUFFER_SIZE, M: MOMENT, N: 80 }) })
    await fetch('/compution-init', { method: 'POST', body: JSON.stringify(serializeSys(system)) })
  })();

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
    next()
    camera.lookAt(earth.position);
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
export {
  bootstrap
}