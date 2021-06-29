import { HaleBopp } from "../sys/body-info"
// import { bootstrap } from './solar'
import { bootstrap } from './uranus'

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

bootstrap(
  scene,
  renderer,
  camera
)