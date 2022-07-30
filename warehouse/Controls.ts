import { PerspectiveCamera } from "three"

export class Controls {
  constructor(camera: PerspectiveCamera) {
    window.addEventListener("keydown", (evt) => {
      const isShift = evt.shiftKey
      switch (evt.code) {
        case "ArrowDown":
          if (isShift) {
            camera.rotation.y += .1
          } else {
            camera.position.x -= 100
          }
          evt.stopPropagation()
          evt.preventDefault()
          break
        case "ArrowUp":
          if (isShift) {
            camera.rotation.y -= .1
          } else {
            camera.position.x += 100
          }
          evt.stopPropagation()
          evt.preventDefault()
          break
        case "ArrowLeft":
          if (isShift) {
            camera.rotation.x += 0.01
          } else {
            camera.position.y += 100
          }
          evt.stopPropagation()
          evt.preventDefault()
          break
        case "ArrowRight":
          if (isShift) {
            camera.rotation.x -= 0.01
          } else {
            camera.position.y -= 100
          }
          evt.stopPropagation()
          evt.preventDefault()
          break
      }
    })
  }
}
