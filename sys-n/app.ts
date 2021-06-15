import { Earth, Sun, Luna, Mars, Mercury, Venus, Jupiter, Neptune, Saturn, Bodies13 } from "../sys/body-info"
import { AU, RAD_PER_DEGREE } from "../sys/constants"

const scene = new THREE.Scene()
scene.background = null

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
)

const renderer = new THREE.WebGLRenderer({ alpha: true })
renderer.setClearColor(0x000000, 0)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const light = new THREE.DirectionalLight("#ffffff", .9)
light.position.set(1, 0, 0)
scene.add(light)

const ami = new THREE.AmbientLight('#ffffff', .02)
scene.add(ami)

const textureLoader = new THREE.TextureLoader()

let animationFns: VoidFunction[] = []

{
  const infos = [
    Bodies13.Earth
  ]

  for (const info of infos) {
    const tex = textureLoader.load(info.map)

    const geometry = new THREE.SphereGeometry(info.radius, 60, 60)
    const material = new THREE.MeshPhongMaterial({ map: tex })

    const body = new THREE.Mesh(geometry, material)
    // body.geometry.computeVertexNormals()

    scene.add(body)

    body.position.set(0, 0, 0)

    body.rotation.x = info.axialTilt

    const yR = (2 * Math.PI) / (info.rotationPeriod * 5184)

    animationFns.push(() => {
      body.rotation.y += yR
    })
  }
}

camera.position.x = 0
camera.position.y = 0
camera.position.z = 50
camera.up.set(0, 1, 0)
camera.lookAt(0, 0, 0)

function animate() {
  requestAnimationFrame(animate)
  for (const fn of animationFns) { fn() }
  renderer.render(scene, camera)
}
animate()

export default 110
