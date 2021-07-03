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
  const geometry = new THREE.SphereGeometry(info.radius, 120, 120)
  const material = new THREE.MeshPhongMaterial({ map: tex })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotateOnAxis(
    new THREE.Vector3(1, 0, 1),
    info.axialTilt
  )
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
      gl_PointSize = 2.0;
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

function path(info: BodyInfo) {

  const geometry = new THREE.BufferGeometry()

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([], 3)
  )

  const [r, g, b] = info.color

  const material = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = .1;
    }
    `,
    fragmentShader: `
    void main() {
      gl_FragColor=vec4(${r}, ${g}, ${b}, 1.0);
    }
    `
  })
  const path = new THREE.Points(geometry, material)
  return path
}

function ring(info: BodyInfo) {
  const geometry = new THREE.BufferGeometry()

  const radius = info.radius * 1.5
  const a = 2 * Math.PI / 100

  const points = Array(100).fill(0).map((p, i) => {
    return [radius * Math.cos(a * i), 0, radius * Math.sin(a * i)]
  }).flat()

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points, 3)
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
  path,
  sphere,
  ring
}