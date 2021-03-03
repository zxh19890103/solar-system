import { Bodies13 } from "./body-info"
import { Body } from "./body.class"
import { RAD_PER_DEGREE } from "./constants"

const { vec3 } = glMatrix

export class Camera {

  viewMat: mat4
  viewMat_t: mat4
  projectionMat: mat4

  coord: vec3
  private lookTo: vec3 = [0, 0, 0]
  private upTo: vec3 = [0, 1, 0]

  get farFromTarget() {
    return vec3.distance(
      this.lookTo,
      this.coord
    )
  }

  get z() {
    return vec3.sub(
      [0, 0, 0],
      this.lookTo,
      this.coord
    )
  }

  readonly aspectRatio: number

  constructor(aspectRatio: number) {
    this.viewMat = glMatrix.mat4.create()
    this.projectionMat = glMatrix.mat4.create()
    this.viewMat_t = glMatrix.mat4.create()
    this.aspectRatio = aspectRatio
  }

  put(coord: ReadonlyVec3) {
    this.coord = glMatrix.vec3.clone(coord)
    return this
  }

  up(up: ReadonlyVec3) {
    this.upTo = glMatrix.vec3.clone(up)
    return this
  }

  see(to: vec3 | Body) {
    if (!this.coord) throw new Error("pls put the cam firstly.")
    this.lookTo = to instanceof Body ? glMatrix.vec3.clone(to.coordinates) : glMatrix.vec3.clone(to)
    this.setViewMat()
    return this
  }

  rotateAboutZ(rad: number) {
    glMatrix.mat4.rotate(
      this.viewMat,
      this.viewMat,
      rad,
      this.z
    )
    glMatrix.mat4.invert(
      this.viewMat_t,
      this.viewMat
    )
    return this
  }

  private setViewMat() {
    glMatrix.mat4.lookAt(
      this.viewMat,
      this.coord,
      this.lookTo,
      this.upTo)

    glMatrix.mat4.invert(
      this.viewMat_t,
      this.viewMat
    )
  }

  private fovy: number = 45 * RAD_PER_DEGREE
  private near: number = .1
  private far: number = 1000
  perspective(fovy: number, near: number, far: number) {
    this.fovy = fovy
    this.near = near
    this.far = far
    this.setPerspectiveMat()
    return this
  }

  private setPerspectiveMat() {
    glMatrix.mat4.perspective(
      this.projectionMat,
      this.fovy,
      this.aspectRatio,
      this.near,
      this.far
    )
  }

  /**
   * @param v V is the coordinates in camera space
   */
  offset(v: vec3) {
    const wc = this.toWorldSpace(v, true)
    vec3.add(this.lookTo, this.lookTo, wc)
    this.see(this.lookTo)
    return this
  }

  /**
   * transforms a coordinates of world into camera space.
   */
  toCamSpace(coord: vec3) {
    return glMatrix.vec3.transformMat4(
      [0, 0, 0],
      coord,
      this.viewMat
    )
  }

  toWorldSpace(coord: vec3, justRotation = false) {
    const v = glMatrix.vec3.transformMat4(
      [0, 0, 0],
      coord,
      this.viewMat_t
    )
    if (justRotation) {
      glMatrix.vec3.sub(
        v,
        v,
        this.coord
      )
    }
    return v
  }

  render(bodies: Body[]) {
    const body = document.body
    const h = document.createElement.bind(document)
    const camDiv = h("div")
    camDiv.className = "camera"

    const form = h("form")
    form.className = "form"

    const looktoInput: HTMLInputElement = h("input")
    looktoInput.className = "form-control"
    looktoInput.type = "text"
    looktoInput.placeholder = "Look At"
    looktoInput.value = this.lookTo.map(x => 0 ^ x).join(",")
    looktoInput.addEventListener("change", (ev) => {
      const target = ev.target as HTMLInputElement
      if (!/^\\d+,\d+,\d+\$/.test(target.value)) return
      const lookat = JSON.parse(target.value)
      this.see(lookat)
    })
    form.appendChild(looktoInput)

    const lookatOptions: HTMLDivElement = h("div")
    lookatOptions.className = "lookat-options"
    lookatOptions.innerHTML = Object.entries(Bodies13).filter(([k, x]) => x.name !== "Earth" && x.name !== "Sun").map(([k, b]) => `
      <a href="?sys=observe&body=${b.name}" data-name="${b.name}">${b.name}</a>
    `).join("")
    // lookatOptions.addEventListener("click", (ev) => {
    //   const target = ev.target as HTMLAnchorElement
    //   if (target.tagName !== "A") return
    //   const name = target.dataset.name
    //   const body = bodies.find(x => x.inf.name === name)
    //   if (!body) return
    //   this.see(body)
    // })

    const perspectiveInput: HTMLInputElement = h("input")
    perspectiveInput.className = "form-control"
    perspectiveInput.type = "text"
    perspectiveInput.placeholder = "FOV-Y"
    perspectiveInput.value = (0 ^ (this.fovy / RAD_PER_DEGREE)).toString()
    perspectiveInput.addEventListener("change", (ev) => {
      const target = ev.target as HTMLInputElement
      if (!/^[\.\d]+$/.test(target.value)) return
      const fovy = Number(target.value)
      this.fovy = fovy * RAD_PER_DEGREE
      this.setPerspectiveMat()
    })

    form.appendChild(looktoInput)
    form.appendChild(lookatOptions)
    form.appendChild(perspectiveInput)

    camDiv.appendChild(form)

    body.appendChild(camDiv)
  }
}