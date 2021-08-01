import * as THREE from 'three'
import { HaleBopp } from "../sys/body-info"
import { bootstrapSolar, bootstrapEarthMoon } from "./bootstrap"
import { PERSPECTIVE_VIEW_FIELD, SKY_BG } from './settings'

const scene = new THREE.Scene()
scene.background = null

const camera = new THREE.PerspectiveCamera(
  PERSPECTIVE_VIEW_FIELD,
  window.innerWidth / window.innerHeight,
  0.1,
  HaleBopp.aphelion
)

const renderer = new THREE.WebGLRenderer({ alpha: true })
renderer.setClearColor(0x000000, 0)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const bg = new Image()
bg.onload = () => {
  document.body.style.backgroundImage = `url(${SKY_BG})`
  bootstrapSolar(
    scene,
    renderer,
    camera
  )
}

bg.src = SKY_BG


