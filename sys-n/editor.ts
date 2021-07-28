
import { AU } from "../sys/constants"
import * as THREE from 'three'
import { BUFFER_MOMENT, MOMENT } from "./settings"

let camera: THREE.Camera = null

let isKeyDown = false
let angleDelta = .01
let zDelta = AU * .1

const test = (_camera: THREE.Camera, _renderer: THREE.WebGLRenderer) => {
  camera = _camera

  const element = _renderer.domElement

  const { clientWidth, clientHeight } = element
  const mat = new THREE.Matrix4()
  mat.multiply(camera.projectionMatrixInverse)
  mat.multiply(
    new THREE.Matrix4().makeScale(
      2 / clientWidth,
      - 2 / clientHeight,
      1
    ))
  mat.multiply(
    new THREE.Matrix4().makeTranslation(
      - clientWidth / 2,
      - clientHeight / 2,
      -1
    )
  )

  let newZAxis = new THREE.Vector3(0, 0, 0)
  let zAxis = new THREE.Vector3(0, 0, -1)

  element.addEventListener('click', (evt) => {
    const { clientX, clientY } = evt
    newZAxis.set(clientX, clientY, 0)
      .applyMatrix4(mat)
      .normalize()
    const n = zAxis.clone().cross(newZAxis).normalize()
    const a = zAxis.angleTo(newZAxis)
    camera.rotateOnAxis(n, a)
  })

  document.addEventListener('keydown', (evt) => {
    isKeyDown = true
    switch (evt.key) {
      case 'ArrowUp':
        angleDelta = .01
        if (evt.metaKey) {
          camera.translateZ(-zDelta)
        } else {
          camera.rotateX(angleDelta)
        }
        break
      case 'ArrowDown':
        angleDelta = -.01
        if (evt.metaKey) {
          camera.translateZ(zDelta)
        } else {
          camera.rotateX(angleDelta)
        }
        break
      case 'ArrowLeft':
        angleDelta = .01
        camera.rotateY(angleDelta)
        break
      case 'ArrowRight':
        angleDelta = -.01
        camera.rotateY(angleDelta)
        break
    }
  })

  document.addEventListener('keyup', (evt) => {
    isKeyDown = false
  })
}

const makeCameraEditable = (camera: THREE.Camera) => {

  document.addEventListener('keydown', evt => {
    evt.stopPropagation()
    evt.preventDefault()

    if (evt.metaKey) {
      switch (evt.key) {
        case 'ArrowUp':
          velocity += 10
          break
        case 'ArrowDown':
          velocity -= 10
          break
      }
    } else {
      switch (evt.key) {
        case 'ArrowUp':
          camera.rotateX(.005)
          break
        case 'ArrowDown':
          camera.rotateX(-.005)
          break
        case 'ArrowLeft':
          camera.rotateY(.005)
          break
        case 'ArrowRight':
          camera.rotateY(-.005)
          break
      }
    }
  })

  const pos = camera.position
  let velocity = 10

  return () => {
    pos.setZ(
      pos.z + velocity * BUFFER_MOMENT
    )
  }
}

export { test, makeCameraEditable }