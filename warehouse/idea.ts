import * as THREE from "three"
import { ArcballControls } from "./ArcballControls"
// import L from "leaflet"
declare var L
// import React from "react"
declare var React
// import ReactDOM from "react-dom"
declare var ReactDOM

const { random } = Math

const randInt = (min: number, max: number) => {
  return min + random() * (max - min)
}

namespace core {
  let _id_seed = 1998

  export interface Constructor<M> {
    new (...args: any[]): M
  }

  export abstract class Base<V> extends L.Evented {
    private lastSnapshot = null
    readonly id = _id_seed++
    $$parent: any = null

    views: Set<V> = new Set()

    abstract fromJSON(d: any): this
    abstract toMyJSON(): any

    snapshot() {
      this.lastSnapshot = this.toMyJSON()
    }

    getLastSnapshot() {
      return this.lastSnapshot
    }

    requestHookCall(effect: string) {
      this.snapshot()
      appendViewHooksCallReq({ context: this, effect })
    }
  }

  type ViewHookCallReq = { context: Base<any>; effect: string }

  const viewHooksCallReqs = new Set<ViewHookCallReq>()
  let isFlushScheduled = false
  let isCallingEffects = false

  const appendViewHooksCallReq = (req: ViewHookCallReq) => {
    viewHooksCallReqs.add(req)

    if (isFlushScheduled) return
    isFlushScheduled = true
    queueMicrotask(flush)
  }

  const flush = () => {
    isCallingEffects = true

    for (const req of viewHooksCallReqs) {
      const { context, effect } = req
      const code = effect.charCodeAt(0)
      const isCapital = code >= 65 && code <= 90
      const method = isCapital ? `on${effect}` : effect
      const snapshot = context.getLastSnapshot()
      for (const view of context.views) {
        view[method] && view[method](snapshot)
      }

      context.fire("effect", { effect })
    }

    viewHooksCallReqs.clear()

    isCallingEffects = false
    isFlushScheduled = false
  }

  export interface BaseView<M> {
    model: M
    onTrash(): void
    onUpdate?(): void
  }

  // this is view;
  /**
   */
  export function baseViewConstruct(this: any, m: any, options: any) {
    this.model = m
    m.views.add(this)
  }

  export interface ViewContainer<M, V> {
    $$value: any
    $$make: ViewMake<M, V>
    add(...items: V[]): void
    remove(...items: V[]): void
  }

  export type ViewMake<M, V> = (m: M) => V
}

namespace model {
  interface Position {
    x: number
    y: number
    z: number
  }

  export class Person extends core.Base<PersonView> {
    position: Position = { x: 0, y: 0, z: 0 }
    size: number = 200

    walk() {
      this.requestHookCall("Walk")
      this.position.x += randInt(-2000, 2000)
      this.position.y += randInt(-2000, 2000)
    }

    setSize(size: number) {
      this.requestHookCall("bigger")
      this.size = size
    }

    override fromJSON(d: any): this {
      this.position = {
        x: randInt(-100, 100),
        y: randInt(-100, 100),
        z: 0,
      }
      return this
    }

    toMyJSON() {
      return {
        position: JSON.parse(JSON.stringify(this.position)),
        size: this.size,
      }
    }
  }

  export interface PersonView extends core.BaseView<Person> {
    onWalk?(...args: any[]): void
    bigger(...args: any[]): void
  }

  export class List<V, M extends core.Base<V>> extends L.Evented {
    items: Set<M> = new Set()
    index: Map<number, M> = new Map()
    size: number = 0
    private _item_C: core.Constructor<M> = null
    private containers: core.ViewContainer<M, V>[] = []

    private isBatching = false

    constructor(C: core.Constructor<M>, items: M[]) {
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

      this.fire("add", { item: m })
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

      this.fire("add.range", { items: items })
    }

    remove(m: M) {
      if (!this.items.has(m)) return
      this.items.delete(m)
      this.index.delete(m.id)

      m.$$parent = null

      this.size -= 1

      m.requestHookCall("Trash")

      if (this.isBatching) return

      this.fire("remove", { item: m })
    }

    removeRange(...items: M[]) {
      this.isBatching = true

      for (const item of items) {
        this.add(item)
      }

      this.isBatching = false

      this.fire("remove.range", { items: items })
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

    addContainer(c: core.ViewContainer<M, V>) {
      this.containers.push(c)
    }
  }
}

namespace view {
  export class Person2D extends L.Rectangle implements model.PersonView {
    model: model.Person

    constructor(person: model.Person, options: any) {
      super(
        [
          [0, 0],
          [0, 0],
        ],
        { color: "#00ff00" }
      )
      core.baseViewConstruct.call(this, person, options)

      this.on("click", (evt) => {
        this.model.$$parent.remove(this.model)
      })

      this.on("mouseover", () => {
        this.model.setSize(400)
      }).on("mouseout", () => {
        this.model.setSize(200)
      })
    }

    private setLatLng(lat: number, lng: number) {
      const { size } = this.model
      this.setBounds(
        L.latLngBounds([-size + lat, -size + lng], [size + lat, size + lng])
      )
    }

    onWalk(): void {
      const { x, y } = this.model.position
      this.setLatLng(y, x)
    }

    onTrash(): void {
      this.remove()
    }

    bigger(): void {
      const { x: lng, y: lat } = this.model.position
      this.setLatLng(lat, lng)
    }
  }

  export class Person2D2 extends L.Circle implements model.PersonView {
    model: model.Person

    constructor(person: model.Person, options: any) {
      super([0, 0], { color: "#00ff00", radius: 1000 })
      core.baseViewConstruct.call(this, person, options)
    }

    onWalk(...args: any[]): void {
      const position = this.model.position
      this.setLatLng([position.y, position.x])
    }

    bigger(...args: any[]): void {}

    onTrash(): void {
      this.remove()
    }
  }

  export class Person3D extends THREE.Mesh implements model.PersonView {
    model: model.Person

    constructor(person: model.Person, options: any) {
      super(
        new THREE.BoxGeometry(2000, 2000, 2000, 120, 120, 120),
        new THREE.MeshPhongMaterial({ color: 0x00ff00, specular: 0x00ffff })
      )
      core.baseViewConstruct.call(this, person, options)
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

    bigger({ size }): void {
      const geometry = this.geometry
      const positions = (geometry as THREE.BufferGeometry).attributes.position
        .array as Array<number>

      const scale = this.model.size / size

      for (let i = 0; i < positions.length; i += 3) {
        const v = new THREE.Vector3(
          positions[i],
          positions[i + 1],
          positions[i + 2]
        ).multiplyScalar(scale)
        positions[i] = v.x
        positions[i + 1] = v.y
        positions[i + 2] = v.z
      }
      ;(geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true
    }
  }

  export class Person3D2 extends THREE.Mesh implements model.PersonView {
    model: model.Person

    constructor(person: model.Person, options: any) {
      super(
        new THREE.SphereGeometry(1000, 120, 120, 120),
        new THREE.MeshPhongMaterial({ color: 0x00ff00, specular: 0x00ffff })
      )
      core.baseViewConstruct.call(this, person, options)
    }

    onWalk(...args: any[]): void {
      const { x, y } = this.model.position
      this.position.set(x, y, 0)
    }

    bigger(...args: any[]): void {}

    onTrash(): void {
      this.removeFromParent()
    }
  }

  export class LeafletContainer<M, V> implements core.ViewContainer<M, V> {
    $$make: core.ViewMake<M, V>
    $$value: any

    constructor(value: any, make: core.ViewMake<M, V>, ...initialItems: M[]) {
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

  export class ThreeContainer<M, V> implements core.ViewContainer<M, V> {
    $$make: core.ViewMake<M, V> = null
    /**
     * L.FeatureGroup, L.LayerGroup, THREE.Group, THREE.Object3D
     */
    $$value: any = null

    constructor(value: any, make: core.ViewMake<M, V>, ...initialItems: M[]) {
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
  persons = new model.List<model.PersonView, model.Person>(
    model.Person,
    []
  ).fromJSON(Array(1).fill(0))

  render() {
    const c = new view.LeafletContainer(
      new L.FeatureGroup(),
      (p: model.Person) => new view.Person2D2(p, {}),
      ...this.persons
    )

    this.persons.addContainer(c)
    return [c]
  }

  render3d() {
    const c = new view.ThreeContainer(
      new THREE.Group(),
      (p: model.Person) => new view.Person3D2(p, {}),
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
    setTimeout(loop, 5)

    if (size < 100 && Math.random() > 0.1) {
      graph.persons.add(new model.Person().fromJSON(null))
      size += 1
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
    const camera = new THREE.PerspectiveCamera(
      45,
      W / H,
      0.1,
      Number.MAX_SAFE_INTEGER
    )

    const directionLight = new THREE.DirectionalLight(0xffffff, 1)
    directionLight.position.set(0, 1, 0)
    scene.add(directionLight)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    camera.up.set(0, 1, 0)
    camera.position.set(0, 100000, 50000)
    camera.lookAt(0, 0, 0)

    scene.add(camera)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      premultipliedAlpha: true,
    })

    renderer.setClearColor(0x000000, 0)
    renderer.setSize(W, H)

    containerElement.appendChild(renderer.domElement)

    const controls = new ArcballControls(camera, renderer.domElement, scene)
    controls.update()

    for (const g of graph.render3d()) {
      scene.add(g.$$value)
    }

    const loop = () => {
      requestAnimationFrame(loop)
      renderer.render(scene, camera)
    }

    loop()
  }

  // dom
  {
    const root = document.querySelector(".dom")
    const h = React.createElement

    let seq = 0
    const reducer = () => {
      return seq++
    }

    const Item = (props: { person: model.Person }) => {
      const { person } = props
      const position = person.position
      const [_, tick] = React.useReducer(reducer, seq)

      React.useEffect(() => {
        person.on("effect", tick)
        return () => {
          person.off("effect", tick)
        }
      }, [])

      return h(
        "li",
        {},
        h(
          "span",
          {},
          "#" + person.id + ` xy:${0 ^ position.x},${0 ^ position.y}`
        ),
        h(
          "a",
          {
            href: "javascript:void(0);",
            style: { marginLeft: 10 },
            onClick: () => {
              graph.persons.remove(person)
            },
          },
          "RM"
        )
      )
    }

    const App = () => {
      const [_, tick] = React.useReducer(reducer, seq)

      React.useEffect(() => {
        graph.persons.on("add add.range remove remove.range", tick)
        return () => {
          graph.persons.off("add add.range remove remove.range", tick)
        }
      }, [])

      return h(
        "ul",
        {},
        ...graph.persons.map((p) => {
          return h(Item, { person: p, key: p.id })
        })
      )
    }

    ReactDOM.render(React.createElement(App), root)
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
 * TODO:
 *
 * 1. remove a container
 *
 *
 *
 *
 *
 *
 */
