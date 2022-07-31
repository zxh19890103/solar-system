import * as THREE from "three"
// import L from "leaflet"
declare var L

const { random } = Math

const randInt = (min: number, max: number) => {
  return min + random() * (max - min)
}

let _id_seed = 1998

interface Constructor<M> {
  new (...args: any[]): M
}

abstract class Base<V> {
  readonly id = _id_seed++
  $$parent: any = null

  views: Set<V> = new Set()

  abstract fromJSON(d: any): this

  requestHookCall(effect: string) {
    for (const view of this.views) {
      view[`on${effect}`] && view[`on${effect}`]()
    }
  }
}

interface BaseView<M> {
  model: M
  onTrash(): void
  onUpdate?(): void
}

// this is view;
/**
 */
function baseViewConstruct(this: any, m: any, options: any) {
  this.model = m
  m.views.add(this)
}

namespace api {
  interface Position {
    x: number
    y: number
    z: number
  }

  export interface ViewContainer<M, V> {
    $$value: any
    $$make: ViewMake<M, V>
    add(...items: V[]): void
    remove(...items: V[]): void
  }

  export type ViewMake<M, V> = (m: M) => V

  export class Person extends Base<PersonView> {
    position: Position = { x: 0, y: 0, z: 0 }

    walk() {
      this.position.x += randInt(-2000, 2000)
      this.position.y += randInt(-2000, 2000)
      this.requestHookCall("Walk")
    }

    override fromJSON(d: any): this {
      this.position = {
        x: randInt(-100, 100),
        y: randInt(-100, 100),
        z: 0,
      }
      return this
    }
  }

  export interface PersonView extends BaseView<Person> {
    onWalk?(): void
    bigger(): void
  }

  export class List<V, M extends Base<V>> extends L.Evented {
    items: Set<M> = new Set()
    index: Map<number, M> = new Map()
    size: number = 0
    private _item_C: Constructor<M> = null
    private containers: ViewContainer<M, V>[] = []

    private isBatching = false

    constructor(C: Constructor<M>, items: M[]) {
      super()
      this._item_C = C
      this.addRange(...items)
    }

    *[Symbol.iterator]() {
      for (const item of this.items) {
        yield item
      }
    }

    fromJSON(data: any[]) {
      for (const d of data) {
        const m = new this._item_C().fromJSON(d)
        this.add(m)
      }
      return this
    }

    map<R>(project: (m: M) => R): R[] {
      const results = []
      for (const item of this.items) {
        results.push(project(item))
      }
      return results
    }

    add(m: M) {
      this.items.add(m)
      this.index.set(m.id, m)

      m.$$parent = this

      this.size += 1

      if (this.isBatching) return
      for (const c of this.containers) {
        c.add(c.$$make(m))
      }
    }

    addRange(...items: M[]) {
      this.isBatching = true

      for (const item of items) {
        this.add(item)
      }

      this.isBatching = false

      for (const c of this.containers) {
        c.add(...items.map(c.$$make))
      }
    }

    remove(m: M) {
      if (!this.items.has(m)) return
      this.items.delete(m)
      this.index.delete(m.id)

      m.$$parent = null

      this.size -= 1

      m.requestHookCall("Trash")

      if (this.isBatching) return
    }

    removeRange(...items: M[]) {
      this.isBatching = true

      for (const item of items) {
        this.add(item)
      }

      this.isBatching = false
    }

    removeById(id: number) {
      if (this.index.has(id)) {
        this.remove(this.index.get(id))
      } else {
        for (const item of this.items) {
          if (item.id === id) {
            this.remove(item)
            break
          }
        }
      }
    }

    addContainer(c: ViewContainer<M, V>) {
      this.containers.push(c)
    }
  }
}

class Person2D extends L.Circle implements api.PersonView {
  model: api.Person

  constructor(person: api.Person, options: any) {
    super([0, 0], { radius: 1000 })
    baseViewConstruct.call(this, person, options)

    this.on("click", (evt) => {
      this.model.$$parent.remove(this.model)
    })
  }

  onWalk(): void {
    const { x, y } = this.model.position
    this.setLatLng(L.latLng(y, x))
  }

  onTrash(): void {
    this.remove()
  }

  bigger(): void {
    this.setRadius(2000)
  }
}

class Person3D extends THREE.Mesh implements api.PersonView {
  model: api.Person

  constructor(person: api.Person, options: any) {
    super(
      new THREE.BoxGeometry(2000, 2000, 2000),
      new THREE.MeshPhongMaterial({ color: 0x00ff00 })
    )
    baseViewConstruct.call(this, person, options)
  }

  rotate() {
    this.rotation.x += 0.1
    this.rotation.y += 0.1
  }

  onWalk(): void {
    const { x, y } = this.model.position
    this.position.set(x, y, 0)
  }

  onTrash(): void {
    this.removeFromParent()
  }

  bigger(): void {}
}

namespace containers {
  export class LeafletContainer<M, V> implements api.ViewContainer<M, V> {
    $$make: api.ViewMake<M, V>
    $$value: any

    constructor(value: any, make: api.ViewMake<M, V>, ...initialItems: M[]) {
      this.$$value = value
      this.$$make = make

      this.add(...initialItems.map(make))
    }

    add(...items: V[]): void {
      for (const item of items) {
        this.$$value.addLayer(item)
      }
    }

    remove(...items: V[]): void {
      for (const item of items) {
        this.$$value.removeLayer(item)
      }
    }
  }

  export class ThreeContainer<M, V> implements api.ViewContainer<M, V> {
    $$make: api.ViewMake<M, V> = null
    /**
     * L.FeatureGroup, L.LayerGroup, THREE.Group, THREE.Object3D
     */
    $$value: any = null

    constructor(value: any, make: api.ViewMake<M, V>, ...initialItems: M[]) {
      this.$$value = value
      this.$$make = make

      this.add(...initialItems.map(make))
    }

    add(...items: V[]): void {
      for (const item of items) {
        this.$$value.add(item)
      }
    }

    remove(...items: V[]): void {
      this.$$value.remove(...items)
    }
  }
}

class Graph {
  persons = new api.List<api.PersonView, api.Person>(api.Person, []).fromJSON(
    Array(1).fill(0)
  )

  render() {
    const c = new containers.LeafletContainer(
      new L.FeatureGroup(),
      (p: api.Person) => new Person2D(p, {}),
      ...this.persons
    )

    this.persons.addContainer(c)
    return [c]
  }

  render3d() {
    const c = new containers.ThreeContainer(
      new THREE.Group(),
      (p: api.Person) => new Person3D(p, {}),
      ...this.persons
    )

    this.persons.addContainer(c)
    return [c]
  }
}

/**
 * 问题：model 的状态变化怎么通知到 view
 * 回答：通过 requestHookCall
 */
// leaflet

const App = () => {
  const graph = new Graph()

  let size = 0

  const loop = () => {
    setTimeout(loop, 3000)

    if (size < 30 && Math.random() > 0.1) {
      graph.persons.add(new api.Person().fromJSON(null))
      size += 1
    } else {
      graph.persons.removeById(0 ^ randInt(0, _id_seed))
    }

    for (const p of graph.persons) p.walk()
  }

  setTimeout(loop, 3000)

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

    const map = L.map(document.querySelector(".map2d") as HTMLDivElement, {
      crs: CRS,
      minZoom: -9,
    })
    map.setView([0, 0], -1)

    for (const layer of graph.render()) {
      map.addLayer(layer.$$value)
    }
  }

  // 3d
  {
    const containerElement = document.querySelector(".map3d")
    const scene = new THREE.Scene()

    const { clientHeight: H, clientWidth: W } = containerElement
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100000)

    const directionLight = new THREE.DirectionalLight(0xffffff, 1)
    directionLight.position.set(0, 0, 1)
    scene.add(directionLight)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    camera.up.set(1, 0, 0)
    camera.position.set(0, 0, 80000)

    scene.add(camera)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      premultipliedAlpha: true,
    })

    renderer.setClearColor(0x000000, 0)
    renderer.setSize(W, H)

    containerElement.appendChild(renderer.domElement)

    for (const g of graph.render3d()) {
      scene.add(g.$$value)
    }

    const loop = () => {
      requestAnimationFrame(loop)
      renderer.render(scene, camera)
    }

    loop()
  }
}

App()

/**
 *
 *
 * When element A removed,
 *
 * element on leaflet's map/group OR on three scene/group/object3d must be removed.
 *
 * Sol:
 * 1. fire events
 * 2.
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
