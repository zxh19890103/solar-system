import * as THREE from "three"
import { AU } from "../sys/constants"
import { Rocket } from "./Rocket.class"

let scene: THREE.Scene = null
let camera: THREE.PerspectiveCamera = null
let renderer: THREE.WebGLRenderer = null

const log = console.log

const setup = () => {
  scene = new THREE.Scene()

  const { innerHeight: H, innerWidth: W } = window
  log(W, H)

  camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 50000)

  // const sunLight = new THREE.DirectionalLight(0xffffff, 1)
  // sunLight.position.set(0, 0, 1)
  // scene.add(sunLight)
  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)

  camera.up.set(0, 1, 0)
  camera.position.set(0, 500, 800)

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    premultipliedAlpha: true,
  })

  renderer.setClearColor(0x000000, 0)
  renderer.setSize(W, H)

  document.body.appendChild(renderer.domElement)
}

const run = () => {
  const rocket = new Rocket()
  rocket.setup()
  rocket.mesh.position.set(0, 0, 0)
  scene.add(rocket.mesh)
  camera.lookAt(0, 0, 0)

  const loop = () => {
    requestAnimationFrame(loop)
    rocket.rotate()
    renderer.render(scene, camera)
  }

  requestAnimationFrame(loop)
}

setup()
run()
