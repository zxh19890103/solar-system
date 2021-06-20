import { TetrahedronGeometry } from "three"
import {
  Earth,
  Sun,
  Luna,
  Mars,
  Mercury,
  Venus,
  Jupiter,
  Neptune,
  Saturn,
  Bodies13,
  BodyInfo,
} from "../sys/body-info"
import { AU, RAD_PER_DEGREE } from "../sys/constants"

import { CelestialBody } from "./gravity"
import { dot, sphere, point, track } from './providers'

const scene = new THREE.Scene()
scene.background = null

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  8000000
)

const renderer = new THREE.WebGLRenderer({ alpha: true })
renderer.setClearColor(0x000000, 0)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// const light = new THREE.DirectionalLight("#ffffff", 1)
// light.position.set(1, 0, 0)
// scene.add(light)

const ami = new THREE.AmbientLight("#ffffff", 1)
scene.add(ami)

// const infos = [Sun, Mercury, Venus, Earth]
const infos = [Earth, Luna]

const bodies = infos.map(info => {
  const { points, updateFn } = track(info)
  const body = new CelestialBody(points, info)
  body.updateFn = updateFn
  scene.add(body.o3)
  return body
})

camera.position.set(0, 0, 500)
camera.up.set(0, 1, 0)
camera.lookAt(0, 0, 0)

const centerBody = bodies.shift()

for (const body of bodies) {
  body.ref = centerBody
  body.init()
}

const rotation = centerBody.o3.rotation

function animate() {
  requestAnimationFrame(animate)
  // rotation.y += .03
  for (const body of bodies) {
    body.next()
  }
  renderer.render(scene, camera)
}
animate()