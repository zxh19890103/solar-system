import * as THREE from 'three'
import { CelestialBody, setVec3RelativeTo } from "../gravity"
import { FAR_OF_CAMERA, system, initializeSystem, setSystemsActive, setSystemOptions, serializeSys } from './solar-data'
import { BUFFER_SIZE, CAMERA_POSITION_Y, MOMENT } from '../settings'
import { makeCameraEditable } from '../editor'
import { AU } from '../../sys/constants'
import { point, sphere } from '../providers'

const bootstrap = (scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.Camera) => {

  setSystemOptions(
    // { name: 'Mars', provider: point, path: false },
    { name: 'Uranus', provider: point, path: true },
    { name: 'Neptune', provider: point, path: true },
    { name: 'Pluto', provider: point, path: true },
    // { name: 'Halley', provider: point, path: true },
    // { name: 'Jupiter', provider: point },
    // { name: 'Saturn' },
    // { name: 'Earth', path: false, provider: point, rotates: true },
    'Sun')
  initializeSystem(system, null)

  const star = system.celestialBody
  star.init(scene)
  const next = CelestialBody.createUniNextFn(star, true)

  const sunLight = new THREE.PointLight(0xffffff, 1)
  sunLight.position.set(0, 0, 0)
  scene.add(sunLight)
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)

  renderer.physicallyCorrectLights = true

  camera.up.set(0, 1, 0)
  camera.position.set(0, 50 * AU, 4 * AU)
  camera.lookAt(0, 0, 0)

  const hello = async () => {
    await fetch('/compution-buffer', { method: 'POST', body: JSON.stringify({ B: BUFFER_SIZE, M: MOMENT, N: 100 }) })
    await fetch('/compution-init', { method: 'POST', body: JSON.stringify(serializeSys(system)) })
  }

  hello()

  const objects = star.flat()
  console.log(...objects)
  const records = []
  let ing = false
  const nextTick = () => {
    console.log(records.length)
    const record = records.shift()
    if (!record) {
      ing = false
      console.log('out')
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