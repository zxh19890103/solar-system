import { Warehouse } from "./Warehouse.class"
import * as THREE from "three"
import { Robot } from "./Robot.class"
import { Controls } from "./Controls"

let scene: THREE.Scene = null
let camera: THREE.PerspectiveCamera = null
let renderer: THREE.WebGLRenderer = null
let controls: any = null

const log = console.log

const setup = () => {
  scene = new THREE.Scene()

  const { innerHeight: H, innerWidth: W } = window
  log(W, H)

  camera = new THREE.PerspectiveCamera(90, W / H, 0.1, 50000)

  const directionLight = new THREE.DirectionalLight(0xffffff, 1)
  directionLight.position.set(0, 0, 1)
  scene.add(directionLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)

  camera.up.set(1, 0, 0)
  camera.position.set(-5000, 0, 6000)

  scene.add(camera)

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    premultipliedAlpha: true,
  })

  renderer.setClearColor(0x000000, 0)
  renderer.setSize(W, H)

  // const controls = new ArcballControls(camera, renderer.domElement, scene)
  {
    // controls = new OrbitControls(camera, renderer.domElement) as any
    // controls.listenToKeyEvents(window) // optional
    // controls.enableDamping = true // an animation loop is required when either damping or auto-rotation are enabled
    // controls.dampingFactor = 0.05

    // controls.screenSpacePanning = false

    // controls.minDistance = 0
    // controls.maxDistance = 500000

    // controls.maxPolarAngle = Math.PI / 2

    controls = new Controls(camera)
  }

  document.body.appendChild(renderer.domElement)
}

const run = () => {
  const warehouse = new Warehouse()
  scene.add(warehouse)
  camera.lookAt(0, 0, 0)

  const robot = new Robot()
  scene.add(robot)

  warehouse.layout({
    m: 30,
    n: 30,
    l: 4000,
    w: 1000,
    h: 3000,
    gapX: 1000,
    gapY: 1000,
  })

  let x = 0,
    y = 1000
  let dx = 100,
    dy = 2000

  const walk = () => {
    x += dx

    if (x > warehouse.length) {
      y += dy
      dx = -100
    }

    if (x < 0) {
      y += dy
      dx = 100
    }
    robot.position.set(x, y, 0)
  }

  // const clock = new THREE.Clock()

  const loop = () => {
    requestAnimationFrame(loop)
    walk()
    renderer.render(scene, camera)
  }

  robot.position.set(x, y, 0)
  loop()
  requestAnimationFrame(loop)
}

setup()
run()
