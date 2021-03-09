import { Bodies13, BodyInfo, Sun } from "./body-info"
import { Body } from "./body.class"
import { Camera } from "./camera.class"
import { AU, SECONDS_IN_A_DAY } from "./constants"
import { range } from "./utils"

const GRAVITY_CONST = 6.67430 * 0.00001 // x 10 ^ -5

const { vec3 } = glMatrix
const { cos, sin, PI, sqrt } = Math

export class Ether {
  bodies: Body[] = []
  $textPanel: HTMLUListElement = null

  readonly unitOfTime: number
  readonly renderPeriod: number
  readonly moveOff: boolean

  private cam: Camera
  set Cam(cam: Camera) {
    this.cam = cam
  }

  get daysPerSec() {
    // raq req = 60?
    return this.unitOfTime * this.renderPeriod * 60 / (60 * 60 * 24)
  }

  constructor(uft: number = 10, rp: number = 100, moveOff: boolean = false) {

    this.unitOfTime = uft
    this.renderPeriod = rp
    this.moveOff = moveOff

    this.initHTMLPanel()

    this.writeLine(`<h2>Welcome to the real solar!</h2>`)
    this.writeLine(`Here 1 second = ${this.duration(this.daysPerSec * 24 * 60 * 60)}.`)
  }

  private initHTMLPanel() {
    this.$textPanel = document.createElement("ul")
    this.$textPanel.className = "ether-text-panel"
    document.body.appendChild(this.$textPanel)

    const buttons = document.createElement("div")
    buttons.className = "buttons"
    buttons.style.display = "none"
    Array(
      "solar", "earth", "mars", "jupiter", "saturn", "neptune",
      "comets",
      "compare",
      "eclipse",
      "observe",
      "moving",
      "moving2",
      "moving3",
      ...Object.keys(Bodies13)
    ).forEach((text, i) => {
      const a = document.createElement("a")
      a.href = `/?sys=${text}`
      a.innerText = i < 6 ? (text + " sys") : text
      buttons.appendChild(a)
    })

    const trigger = document.createElement("a")
    trigger.href = "javascript:void(0);"
    trigger.textContent = "#"
    trigger.className = "trigger"
    trigger.onclick = () => {
      if (buttons.style.display)
        buttons.style.display = ""
      else
        buttons.style.display = "none"
    }
    document.body.appendChild(trigger)
    document.body.appendChild(buttons)
  }

  put(b: Body) {
    if (this.bodies.includes(b)) return
    const inf = b.inf
    const angleOnXY = b.angleOnXY

    if (b.coordinates === undefined) {
      const xy = inf.aphelion * cos(inf.inclination)
      b.coordinates = [
        xy * cos(angleOnXY),
        xy * sin(angleOnXY),
        inf.aphelion * sin(inf.inclination)
      ]

      b.rotates(angleOnXY, [0, 0, 1])
      b.rotates(inf.inclination, [0, 1, 0])
    }

    if (b.velocity === undefined) {
      const speed = this.computesOrbitSpeedOnR(
        b.inf.semiMajorAxis,
        b.inf.aphelion,
        b.inf.ref
      )
      b.velocity = [
        speed * cos(angleOnXY + PI / 2),
        speed * sin(angleOnXY + PI / 2),
        0
      ]
    }

    if (inf.rotationPeriod) {
      b.RotationSpeed = Math.PI * 2 / (60 * inf.rotationPeriod / this.daysPerSec)
    }

    b.translates()
    this.bodies.push(b)

    const rgba = [].map.call(b.inf.color, c => 0 ^ c * 255)

    if (this.moveOff) {
      this.writeLine(`<span style="color: rgba(${rgba.join(',')})">${inf.name}</span> a= ${(b.inf.aphelion / AU).toFixed(2)} au; r= ${(b.inf.radius * 1000).toFixed(2)} km; rop= ${b.inf.rotationPeriod.toFixed(3)} days`)
      return b
    }

    if (vec3.len(b.velocity) === 0) {
      this.writeLine(`<span style="color: rgba(${rgba.join(',')})">${inf.name}</span>, the center, no orbital period.`)
      return b
    }

    const orbitalPeriod = this.computesOrbitalPeriod(inf.semiMajorAxis, b.inf.ref)
    const secBodyTakes = orbitalPeriod / this.daysPerSec

    if (b.framesCountOfOrbitFin === 0) {
      b.framesCountOfOrbitFin = 0 ^ secBodyTakes * 60 * 4
    }

    this.writeLine(`<span style="color: rgba(${rgba.join(',')})">${inf.name}</span> ${this.duration(secBodyTakes)}, ${orbitalPeriod.toFixed(2)} days.`)

    return b
  }

  async boot() {
    const frames = []
    const programs = this.bodies.map(b => b.programs).flat()
    for (const prog of programs) {
      await prog.setup()
      frames.push(prog.boot())
    }
    return frames
  }

  private animationDataReaderOffset: number = 0
  private waitingNewBundle: boolean = true
  move() {
    if (this.moveOff) return
    if (this.waitingNewBundle) return
    if (this.animationDataReaderOffset >= this.animationDataReader.byteLength) {
      if (this.waitingNewBundle) return
      this.worker.postMessage("next")
      this.waitingNewBundle = true
      console.log("requests new bundle!")
      return
    }

    const reader = this.animationDataReader

    for (const b of this.bodies) {
      const { coordinates, velocity } = b
      for (let i = 0; i < 3; i++) {
        coordinates[i] = reader.getFloat32(this.animationDataReaderOffset)
        this.animationDataReaderOffset += 4
      }
      for (let i = 0; i < 3; i++) {
        velocity[i] = reader.getFloat32(this.animationDataReaderOffset)
        this.animationDataReaderOffset += 4
      }
      b.translates()
    }
  }

  computesOrbitSpeedOnR(sma: number, r: number, ref?: BodyInfo) {
    if (sma === 0) return 0
    const m = ref ? ref.mass : Sun.mass
    return Math.sqrt(GRAVITY_CONST * m * (2 / r - 1 / sma))
  }

  /**
   * returns days.
   */
  computesOrbitalPeriod(sma: number, ref?: BodyInfo) {
    const a = sma // * pow(10, 6)
    const g = GRAVITY_CONST //  * pow(10, -12)
    const m = (ref ? ref.mass : Sun.mass) // * pow(10, 24)
    return PI * 2 * sqrt(a * a * a / (g * m)) / SECONDS_IN_A_DAY
  }

  duration(seconds: number) {
    if (seconds < 1) return seconds.toFixed(2) + 'sec'
    const overs = [60, 60, 24, Infinity]
    const units = ['sec', 'min', 'hr', 'dy']
    let rem = 0 ^ seconds
    let m = 0
    let exp = ""
    while (m = overs.shift()) {
      if (rem % m === 0) {
        units.shift()
      } else {
        exp = `${rem % m}${units.shift()}${exp}`
      }
      rem = 0 ^ (rem / m)
      if (rem === 0) break
    }
    return exp
  }

  writeLine(text: string) {
    const li = document.createElement("li")
    li.innerHTML = text
    this.$textPanel.appendChild(li)
  }

  private animationDataReader: DataView = null
  private worker: Worker = null
  // only once!!!!
  connectsWithWorker(worker: Worker) {
    this.worker = worker
    const bodies = this.bodies
    const n = bodies.length
    const buffer = new Float32Array(n * 7 + 2)
    const writer = new DataView(buffer.buffer)
    let offset = 0

    writer.setFloat32(
      offset,
      this.renderPeriod
    )
    offset += 4

    writer.setFloat32(
      offset,
      this.unitOfTime
    )
    offset += 4

    for (const body of bodies) {
      const data = [
        ...body.coordinates, // 3
        ...body.velocity, // 3
        body.inf.mass // 1
      ]
      for (const num of data) {
        writer.setFloat32(
          offset,
          num
        )
        offset += 4
      }
    }
    worker.postMessage(buffer)

    worker.onmessage = ({ data }) => {
      this.waitingNewBundle = false
      this.animationDataReaderOffset = 0
      this.animationDataReader = new DataView(data.buffer)
    }
  }
}