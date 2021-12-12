import * as THREE from 'three'
import { BodyInfo } from "../sys/body-info"
import { RADIUS_SCALE } from './settings'

const textureLoader = new THREE.TextureLoader()

function sphere(info: BodyInfo) {
  const tex = textureLoader.load(info.map)
  const geometry = new THREE.SphereGeometry(info.radius * RADIUS_SCALE, 60, 60)
  const material = new THREE.MeshPhongMaterial({ map: tex, specular: 0x000000 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotateX(info.axialTilt + info.inclination)
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
      gl_PointSize = 1.5;
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
      gl_PointSize = 6.0;
    }
    `,
    fragmentShader: `
    void main() {
      gl_FragColor=vec4(${r * .2}, ${g * .2}, ${b * .2}, 1.0);
    }
    `
  })
  const path = new THREE.Line(geometry, material)
  return path
}

function ring(info: BodyInfo) {
  const geometry = new THREE.BufferGeometry()

  const radius = info.radius * 1.5
  const a = 2 * Math.PI / 100

  const points = Array(400).fill(0).map((p, i) => {
    const r = radius + Math.random()
    const b = a + Math.random()
    return [r * Math.cos(b * i), Math.random() - .5, r * Math.sin(b * i)]
  }).flat()

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points, 3)
  )

  const material = new THREE.ShaderMaterial({
    vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 0.2;
    }
    `,
    fragmentShader: `
    void main() {
      gl_FragColor=vec4(0.2, .4, .1, 1);
    }
    `
  })

  const point = new THREE.Points(geometry, material)

  return point
}

function zAxis(info: BodyInfo) {
  const geometry = new THREE.BufferGeometry()

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([0, - 1.5 * info.radius, 0, 0, 1.5 * info.radius, 0], 3)
  )

  const material = new THREE.ShaderMaterial({
    vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 0.5;
    }
    `,
    fragmentShader: `
    void main() {
      gl_FragColor=vec4(1.0, 1.0, 1.0, 1.0);
    }
    `
  })

  return new THREE.Line(geometry, material)
}

function tail(info: BodyInfo) {

  const geometry = new THREE.BufferGeometry()

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3)
  )

  const [r, g, b] = info.color

  const material = new THREE.ShaderMaterial({
    vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    void main() {
      gl_FragColor=vec4(${r}, ${g}, ${b}, 1.0);
    }
    `
  })
  const o3 = new THREE.Line(geometry, material)
  return o3
}

function peribelionAndAphelion(info: BodyInfo) {

  const geometry = new THREE.BufferGeometry()

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3)
  )

  const [r, g, b] = info.color

  const material = new THREE.ShaderMaterial({
    vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 5.0;
    }
    `,
    fragmentShader: `
    void main() {
      gl_FragColor=vec4(${r}, ${g}, ${b}, 1.0);
    }
    `
  })
  const o3 = new THREE.Points(geometry, material)
  return o3
}

export {
  point,
  path,
  tail,
  sphere,
  ring,
  peribelionAndAphelion
}