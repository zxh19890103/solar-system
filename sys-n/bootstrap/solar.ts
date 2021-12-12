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
    { name: 'Mercury', provider: point, path: false, rotates: true },
    { name: 'Venus', provider: point, path: false, rotates: true },
    { name: 'Earth', path: false, provider: point, rotates: true },
    { name: 'Mars', provider: point, rotates: true, path: false, },
    // { name: 'Uranus', provider: sphere, path: false, rotates: true },
    { name: 'Neptune', provider: point, path: false, rotates: true },
    // { name: 'Pluto', provider: point, path: true },
    { name: 'Halley', provider: point, path: true },
    { name: 'Holmes', provider: point, path: true },
    // { name: 'HaleBopp', provider: point, path: true },
    { name: 'Jupiter', provider: point, path: false, rotates: true },
    { name: 'Saturn', provider: point, path: false, rotates: true },
    { name: 'Sun', provider: point, rotates: false })

  initializeSystem(system, null)

  const star = system.celestialBody
  star.init(scene)
  // const earth = star.find('Earth');
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
  const cameraWhere = new THREE.Vector3(0, 20 * AU, 60 * AU);

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
    // camera.lookAt(0, 0, 0)
    requestAnimationFrame(nextTick)
  }

  computionResultJsonp((data) => {
    records.push(...data)
    if (ing) return
    ing = true
    nextTick()
  })

  //#region editor
  {
    const canvasElement = renderer.domElement
    const x0 = 0 ^ canvasElement.clientWidth / 2
    const y0 = 0 ^ canvasElement.clientHeight / 2

    let state = 0

    const rotation = camera.rotation

    const tick = () => {
      if (state === 0) {
        return
      }
      if (state === 1) {
        rotation.y += .001
      } else if (state === 2) {
        rotation.y -= .001
      }
      requestAnimationFrame(tick)
    }

    canvasElement.addEventListener('mousemove', e => {
      const { clientX, clientY } = e
      const x = clientX - x0
      const y = clientY - y0

      const isvalid = x < 100 && x > -100 && y < 100 && y > -100
      if (!isvalid) return
      const nextState = x > 5 ? 1 : x < 5 ? 2 : 0
      if (state !== nextState) {
        state = nextState
        // tick()
      }
    })
  }
  //#endregion
}

export default bootstrap
export {
  bootstrap
}