import { Camera } from "../common/camera.class"
import { RAD_PER_DEGREE } from "../common/constants"
import { ObjectProgram } from "../common/program.class"
import { randColor, parseColor } from "../common/utils"
import { FloorThing } from "./floor.class"
import { HornThing } from "./horn.class"
import { PillarThing } from "./pillar.class"

export class HuanghelouProgram extends ObjectProgram {
  constructor(
    gl: WebGLRenderingContext,
    cam: Camera
  ) {
    super(
      gl,
      cam,
      "huanghelou"
    )
  }

  getTick() {

    super.beforeGetTick()

    const { gl, program } = this

    const ceil0 = new FloorThing(5, Math.PI * .32)
    ceil0.make()
    const { vertices, colors, indices } = ceil0
    const renderer = ceil0.render(gl)

    console.log("Total Vertex:", ceil0.VertexCount)

    const setVertices = this.setFloat32Attrib("aVertex", vertices, 3)
    const setVertexCorlours = this.setFloat32Attrib("aVertexColor", colors, 4)
    this.bufferUInt16Array(indices)

    setVertices()
    setVertexCorlours()

    this.setUniformMatrix4fv(
      "uModelMat",
      glMatrix.mat4.create()
    )()

    const rotationMat = glMatrix.mat4.create()
    const setRotationUniform = this.setUniformMatrix4fv("uRotationMat", rotationMat)
    const doRot = () => {
      glMatrix.mat4.rotate(
        rotationMat,
        rotationMat,
        .01,
        [0, 0, 1]
      )
      setRotationUniform()
    }

    return () => {
      gl.useProgram(program)
      doRot()
      renderer()
    }
  }
}