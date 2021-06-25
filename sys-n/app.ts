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
  Phobos,
  Deimos,
  Lo,
  Europa,
  Ganymede,
  Callisto,
} from "../sys/body-info"
import { AU, RAD_PER_DEGREE } from "../sys/constants"

import { CelestialBody } from "./gravity"
import { dot, sphere, point } from "./providers"

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
    Holmes,
    Halley,
    {
      hidden: true,
      body: Earth,
      subSystems: [
        {
          body: Luna
        }
      ]
    },
    {
      hidden: true,
      body: Mars,
      subSystems: [
        { body: Phobos },
        { body: Deimos }
      ]
    },
    {
      hidden: true,
      body: Jupiter,
      subSystems: [
        { body: Lo },
        { body: Europa },
        { body: Ganymede },
        { body: Callisto }
      ]
    }
  ],
}

const make = () => {
  const mkNode = (sys: CelestialSystem, parent: CelestialSystem) => {
    if (sys.hidden) return
    if (parent === null) {
      sys.celestialBody = new CelestialBody(dot(sys.body), sys.body)
    } else {
      sys.celestialBody = new CelestialBody(point(sys.body), sys.body)
      parent.celestialBody.add(sys.celestialBody)
      sys.celestialBody.init()
    }
    if (sys.subSystems) {
      for (const subSys of sys.subSystems) {
        const info = subSys as BodyInfo
        if (info.name) {
          mkNode({ body: info }, sys)
        } else {
          mkNode(subSys as CelestialSystem, sys)
        }
      }
    }
  }

  mkNode(system, null)
}

make()

scene.add(system.celestialBody.o3)

camera.position.set(0, 0, 1.4 * Jupiter.aphelion)
camera.up.set(0, 1, 0)
camera.lookAt(0, 0, 0)

const star = system.celestialBody

const next = star.bootstrap()
function animate() {
  requestAnimationFrame(animate)
  next()
  renderer.render(scene, camera)
}
animate()
