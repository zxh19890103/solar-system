
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
  Ceres,
  HaleBopp,
  Halley,
  Pluto,
  Tempel1,
  Holmes,
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
  HaleBopp.aphelion
)

const renderer = new THREE.WebGLRenderer({ alpha: true })
renderer.setClearColor(0x000000, 0)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const light = new THREE.DirectionalLight("#ffffff", 1)
light.position.set(1, 1, 0)
scene.add(light)

const ami = new THREE.AmbientLight("#ffffff", .3)
scene.add(ami)

const infos = [Sun, Earth, Jupiter, Holmes]

const bodies = infos.map(info => {
  if (info.name === Sun.name) {
    const o3 = point(info)
    const body = new CelestialBody(o3, info)
    scene.add(body.o3)
    return body
  } else {
    const o3 = point(info)
    const body = new CelestialBody(o3, info)
    scene.add(body.o3)
    return body
  }
})

camera.position.set(0, 0, 1.4 * Holmes.aphelion)
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
  rotation.y += .03
  for (const body of bodies) {
    body.next()
  }
  renderer.render(scene, camera)
}
animate()