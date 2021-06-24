
import { Object3D } from "three"
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

// const light = new THREE.DirectionalLight("#ffffff", 1)
// light.position.set(1, 1, 0)
// scene.add(light)

// const ami = new THREE.AmbientLight("#ffffff", .3)
// scene.add(ami)

const system: CelestialSystem = {
  body: Sun,
  subSystems: [
    {
      body: Earth,
      subSystems: [
        {
          body: Luna
        }
      ]
    }
  ]
}

const make = () => {
  const mkNode = (sys: CelestialSystem, parent: CelestialSystem) => {
    sys.celestialBody = new CelestialBody(point(sys.body), sys.body)
    if (parent !== null) {
      parent.celestialBody.add(sys.celestialBody)
      sys.celestialBody.init()
    }
    if (sys.subSystems) {
      for (const subSys of sys.subSystems) {
        mkNode(subSys, sys)
      }
    }
  }

  mkNode(system, null)
}

make()

scene.add(system.celestialBody.o3)

camera.position.set(0, 0, Earth.aphelion)
camera.up.set(0, 1, 0)
camera.lookAt(0, 0, 0)

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
animate()