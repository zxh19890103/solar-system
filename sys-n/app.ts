import * as THREE from 'three'
import { HaleBopp } from "../sys/body-info"
import { bootstrapSolar, bootstrapHalley } from "./bootstrap"
import { PERSPECTIVE_VIEW_FIELD, SKY_BG } from './settings'

const scene = new THREE.Scene()
scene.background = null

const camera = new THREE.PerspectiveCamera(
  PERSPECTIVE_VIEW_FIELD,
  window.innerWidth / window.innerHeight,
  0.1,
  HaleBopp.aphelion
)

const renderer = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: true })
renderer.setClearColor(0x000000, 0)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

bootstrapHalley(
  scene,
  renderer,
  camera
)


