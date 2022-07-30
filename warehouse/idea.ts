// import L from 'leaflet'
import * as THREE from "three"

declare var L

class Base<V> {
  view: V

  fromJSON(d: any) {
    return this
  }

  requestHookCall(effect: string) {
    // this["on" + effect]()
    this.view[`on${effect}`]()
  }
}

interface BaseView<S> {
  model: S
  onUpdate?(): void
}

// this is view;
/**
 */
function baseViewConstruct(this: any, m: any, options: any) {
  this.model = m
  m.view = this
}

namespace api {
  interface Position {
    x: number
    y: number
    z: number
  }

  export class Person extends Base<PersonView> {
    position: Position = { x: 0, y: 0, z: 0 }

    pick(food: string) {}
    openMouse() {}
    putIn() {}

    walk() {
      this.position.x += 10
      this.position.y += 10
      this.requestHookCall("Walk")
    }
  }

  export interface PersonView extends BaseView<Person> {
    eat(): void
    onWalk?(): void
  }
}

class Person2D extends L.Circle implements api.PersonView {
  model: api.Person

  constructor(person: api.Person, options: any) {
    super([0, 0], { radius: 1000 })
    baseViewConstruct.call(this, person, options)
  }

  eat(): void {
    this.model.pick("fish")
    this.model.openMouse()
    this.model.putIn()
  }

  onWalk(): void {
    const { x, y } = this.model.position
    this.setLatLng(L.latLng(y, x))
  }
}

class Person3D extends THREE.Mesh implements api.PersonView {
  model: api.Person

  constructor(person: api.Person, options: any) {
    super(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhongMaterial({ color: 0x00ff00 })
    )
    baseViewConstruct.call(this, person, options)
  }

  eat(): void {
    this.model.pick("fish")
    this.model.openMouse()
    this.model.putIn()
  }

  onWalk(): void {
    const { x, y } = this.model.position
    this.position.set(x, y, 0)
  }
}

/**
 * 问题：model 的状态变化怎么通知到 view
 * 回答：通过 requestHookCall
 *
 */

// leaflet

const App = () => {
  const state = {
    person: new api.Person().fromJSON({
      name: "ronnie",
      age: 17,
    }),
  }

  const loop = () => {
    requestAnimationFrame(loop)
    state.person.walk()
  }

  // 2d
  {
    const INITIAL_SCALE_FACTOR = 0.0125

    /**
     * Represents an affine transformation: a set of coefficients
     * a, b, c, d for transforming a point of a form (x, y) into (a*x + b, c*y + d) and doing the reverse.
     * Used by Leaflet in its projections code.
     */
    const CRS = L.extend({}, L.CRS.Simple, {
      transformation: new L.Transformation(
        INITIAL_SCALE_FACTOR,
        0,
        -INITIAL_SCALE_FACTOR,
        0
      ),
    })

    const map = L.map(document.querySelector(".map2d"), { crs: CRS })
    const person = new Person2D(state.person, {})
    map.setView([0, 0], 0)
    map.addLayer(person)
  }

  // 3d
  {
    const containerElement = document.querySelector(".map3d")
    const scene = new THREE.Scene()

    const { clientHeight: H, clientWidth: W } = containerElement
    const camera = new THREE.PerspectiveCamera(90, W / H, 0.1, 50000)

    const directionLight = new THREE.DirectionalLight(0xffffff, 1)
    directionLight.position.set(0, 0, 1)
    scene.add(directionLight)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    camera.up.set(1, 0, 0)
    camera.position.set(-5000, 0, 6000)

    scene.add(camera)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      premultipliedAlpha: true,
    })

    renderer.setClearColor(0x000000, 0)
    renderer.setSize(W, H)

    containerElement.appendChild(renderer.domElement)

    const person = new Person3D(state.person, {})
    scene.add(person)
  }

  setTimeout(loop, 10)
}

App()
