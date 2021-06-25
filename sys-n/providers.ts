import { BodyInfo } from "../sys/body-info"

function dot(info: BodyInfo) {
  const vertices = [0, 0, 0]

  const geometry = new THREE.BufferGeometry()

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  )

  const [r, g, b] = info.color

  const material = new THREE.PointsMaterial({ color: new THREE.Color(r, g, b), size: info.radius })

  const points = new THREE.Points(geometry, material)

  return points
}

const textureLoader = new THREE.TextureLoader()

function sphere(info: BodyInfo) {
  const tex = textureLoader.load(info.map)
  const geometry = new THREE.SphereGeometry(info.radius, 60, 60)
  const material = new THREE.MeshDistanceMaterial({ map: tex })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

function point(info: BodyInfo) {

  const geometry = new THREE.BufferGeometry()

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([0, 0, 0], 3)
  )

  const [r, g, b] = info.color

  const material = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 1.0;
    }
    `,
    fragmentShader: `
    void main() {
      gl_FragColor=vec4(${r}, ${g}, ${b}, 1.0);
    }
    `
  })

  const point = new THREE.Points(geometry, material)

  return point
}

export {
  dot,
  point,
  sphere
}