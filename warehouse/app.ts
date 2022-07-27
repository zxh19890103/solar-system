import * as THREE from "three"
import { CameraHelper } from "three"
import { Warehouse } from "./Warehouse.class"
import { ArcballControls } from "./ArcballControls"
import { FlyControls } from "./FlyControls"

let scene: THREE.Scene = null
let camera: THREE.PerspectiveCamera = null
let renderer: THREE.WebGLRenderer = null

const log = console.log

const setup = () => {
  scene = new THREE.Scene()

  const { innerHeight: H, innerWidth: W } = window
  log(W, H)

  camera = new THREE.PerspectiveCamera(90, W / H, 0.1, 50000)

  const ambientLight = new THREE.AmbientLight(0xa3ff00, 1)
  scene.add(ambientLight)

  camera.up.set(0, 1, 0)
  camera.position.set(0, -8000, 10000)

  // scene.add(new CameraHelper(camera))
  scene.add(camera)

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    premultipliedAlpha: true,
  })

  renderer.setClearColor(0x000000, 0)
  renderer.setSize(W, H)

  const controls = new ArcballControls(camera, renderer.domElement, scene)

  controls.addEventListener("change", () => {
    renderer.render(scene, camera)
  })

  controls.update();

  document.body.appendChild(renderer.domElement)
}

const run = () => {
  const warehouse = new Warehouse()
  scene.add(warehouse)
  camera.lookAt(0, 0, 0)

  warehouse.layout({
    m: 100,
    n: 100,
    l: 4000,
    w: 1000,
    h: 3000,
    gapX: 1000,
    gapY: 1000,
  })

  const loop = () => {
    // requestAnimationFrame(loop)
    // warehouse.rotation.z += 0.005
  }
  
  renderer.render(scene, camera)

  requestAnimationFrame(loop)
}

setup()
run()
