/**
 * Steps:
 *  - create a program of GL with 2 types' of shader created and loaded.
 *  - create buffer of positions
 *  - draw:
 *    - clear & enable depth test
 *    - set attributes (color & vertices) to shaders.
 *    - create matrixs and uniforms them.
 *    - draw arrays.
 */

function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)

  // Create the shader program
  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram))
    return null
  }

  return shaderProgram
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type)

  // Send the source to the shader object

  gl.shaderSource(shader, source)

  // Compile the shader program

  gl.compileShader(shader)

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

const loadRemoteShaderCode = async (url: string) => {
  const resp = await fetch(url)
  return await resp.text()
}

const setUpGLContext = (): [WebGLRenderingContext, number, number] => {
  const canvasElement = document.createElement("canvas")
  const w = window.innerWidth
  const h = window.innerHeight
  canvasElement.width = w
  canvasElement.height = h
  document.body.appendChild(canvasElement)
  const gl = canvasElement.getContext("webgl")
  return [gl, w, h]
}

const generateSpherePoints = (r: number) => {
  const { PI, sin, cos } = Math
  const points: number[] = []
  const total = 30, half = total / 2
  let alpha = 0, beta = 0, zr = 0
  for (let y = 0; y < total; y += 1) {
    alpha = PI * (y - half) / total
    zr = r * cos(alpha)
    for (let x = 0; x < total; x += 1) {
      beta = 2 * PI * x / total
      points.push(
        zr * cos(beta),
        zr * sin(beta),
        r * sin(alpha)
      )
    }
  }
  return points
}

const main = async () => {
  const [gl, w, h] = setUpGLContext()

  const vsCode = await loadRemoteShaderCode("/shaders/vertex.glsl")
  const fsCode = await loadRemoteShaderCode("/shaders/fragment.glsl")

  const program = initShaderProgram(gl, vsCode, fsCode)

  const bindFloatArrayToGPU = (data: number[], attribName: string, pointerSize: number) => {
    const farray = new Float32Array(data)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, farray, gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, attribName)
    gl.vertexAttribPointer(
      loc, pointerSize, gl.FLOAT, false, 0, 0
    )
    gl.enableVertexAttribArray(loc)
  }

  const create3Matrices = () => {
    const [model, view, projection] = Array(3).fill(0).map(() => {
      return glMatrix.mat4.create()
    })

    const locations = Array('model', 'view', 'projection').map(name => {
      return gl.getUniformLocation(program, name)
    })

    glMatrix.mat4.lookAt(
      view,
      [0, 30, 30],
      [0, 0, 0],
      [0, 1, 0])

    glMatrix.mat4.perspective(
      projection,
      Math.PI * .5,
      w / h,
      1.0,
      100.0
    )

    return {
      rotate: () => {
        glMatrix.mat4.rotate(
          model,
          model,
          Math.PI * .001,
          [0, 1, 1]
        )
      },
      uniform: (m = 1, v = 1, p = 1) => {
        m && gl.uniformMatrix4fv(locations[0], false, model)
        v && gl.uniformMatrix4fv(locations[1], false, view)
        p && gl.uniformMatrix4fv(locations[2], false, projection)
      }
    }
  }

  const points = generateSpherePoints(10)
  console.log(points)
  bindFloatArrayToGPU(
    points,
    "aVertex",
    3
  )

  // bindFloatArrayToGPU(
  //   [
  //     1, 0, 0, 1,
  //     0, 1, 0, 1,
  //     0, 0, 1, 1
  //   ],
  //   "aColor",
  //   4
  // )

  gl.useProgram(program)

  const { rotate, uniform } = create3Matrices()
  uniform(1, 1, 1)

  const loop = () => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)  // Clear to black, fully opaque
    gl.clearDepth(1.0)                 // Clear everything
    gl.enable(gl.DEPTH_TEST)           // Enable depth testing
    gl.depthFunc(gl.LEQUAL)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    uniform(1, 0, 0)
    rotate()

    gl.drawArrays(gl.LINES, 0, points.length / 3)

    requestAnimationFrame(loop)
  }

  loop()

}

main()