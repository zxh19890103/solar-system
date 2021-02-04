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

const initShaderProgram = (gl, vsSource, fsSource) => {
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

const loadShader = (gl, type, source) => {
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

const loadTexture = async (gl: WebGLRenderingContext, url: string) => {
  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  const img = await loadImage(url)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0, // level
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    img
  )
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
}

const loadImage = (url: string) => {
  return new Promise<HTMLImageElement>((done, fail) => {
    const img = new Image()
    img.onload = () => {
      done(img)
    }
    img.onerror = fail
    img.src = url
  })
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

const main = async () => {
  const defineFloat32Attrib = (data: number[], attribName: string, pointerSize: number) => {
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

  const defineUniform3fv = (name: string, value: Iterable<number>) => {
    const loc = gl.getUniformLocation(program, name)
    gl.uniform3fv(loc, value)
  }

  const defineUniformMatrix4fv = (name: string): [mat4, voidFn] => {
    const mat4 = glMatrix.mat4.create()
    const loc = gl.getUniformLocation(program, name)
    return [
      mat4,
      () => {
        gl.uniformMatrix4fv(loc, false, mat4)
      }]
  }

  const createMVP = () => {
    const [model, uniformModel] = defineUniformMatrix4fv("model")
    const [view, uniformView] = defineUniformMatrix4fv("view")
    const [projection, uniformProj] = defineUniformMatrix4fv("projection")

    glMatrix.mat4.lookAt(
      view,
      [0, 100, 40],
      [0, 0, 0],
      [0, 0, 1])

    glMatrix.mat4.perspective(
      projection,
      Math.PI * .5,
      w / h,
      1.0,
      100.0
    )

    uniformView()
    uniformProj()

    return {
      rotate: () => {
        glMatrix.mat4.rotate(
          model,
          model,
          Math.PI * .005,
          [0, .4, 1]
        )
        uniformModel()
      }
    }
  }

  const makeVertex = (lat: number, lon: number) => {
    const alpha = PI * (.5 - lat / M)
    const beta = DOUBLE_PI * (lon / N)
    return [
      R * cos(alpha) * cos(beta),
      R * cos(alpha) * sin(beta),
      R * sin(alpha)
    ]
  }

  const makeTexCoords = (lat: number, lon: number) => {
    return [
      lon / N,
      lat / M
    ]
  }

  const randColor = () => {
    return Array(4).fill(0).map((v, i) => {
      if (i === 3) return 1
      return Math.random()
    })
  }

  const { PI, cos, sin } = Math
  const HALF_PI = PI / 2
  const DOUBLE_PI = 2 * PI

  const vertices: number[] = []
  const normals: number[] = []
  const texCoords: number[] = []
  const indices: number[] = []
  const colors: number[] = []
  // M is the latitudes' count
  // N is the longitudes' count
  const M = 30, N = 60, R = 50

  let lat = 0, lon = 0, index = 0
  for (; lat < M; lat += 1) {
    for (lon = 0; lon < N; lon += 1) {
      indices.push(
        index++,
        index++,
        index++,
        index - 1,
        index - 2,
        index++,
      )
      vertices.push(...makeVertex(lat, lon))
      vertices.push(...makeVertex(lat, lon + 1))
      vertices.push(...makeVertex(lat + 1, lon))
      vertices.push(...makeVertex(lat + 1, lon + 1))
      // const fillColor = randColor()
      // colors.push(...fillColor, ...fillColor, ...fillColor, ...fillColor)
      texCoords.push(
        ...makeTexCoords(lat, lon),
        ...makeTexCoords(lat, lon + 1),
        ...makeTexCoords(lat + 1, lon),
        ...makeTexCoords(lat + 1, lon + 1)
      )
    }
  }

  const [gl, w, h] = setUpGLContext()

  const vsCode = await loadRemoteShaderCode("/shaders/vertex.glsl")
  const fsCode = await loadRemoteShaderCode("/shaders/fragment.glsl")

  const program = initShaderProgram(gl, vsCode, fsCode)

  defineFloat32Attrib(
    vertices,
    "aVertex",
    3
  )

  // defineFloat32Attrib(
  //   colors,
  //   "aVertexColor",
  //   4
  // )

  defineFloat32Attrib(
    texCoords,
    "aVertexTexCoord",
    2
  )

  const indicesBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

  await loadTexture(gl, "/maps/earthmap1k.jpg")

  gl.useProgram(program)
  gl.activeTexture(gl.TEXTURE0)
  gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0)

  const { rotate } = createMVP()

  const INDICES_COUNT = indices.length

  const loop = () => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)  // Clear to black, fully opaque
    gl.clearDepth(1.0)                 // Clear everything
    gl.enable(gl.DEPTH_TEST)           // Enable depth testing
    gl.depthFunc(gl.LEQUAL)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    rotate()

    gl.drawElements(gl.TRIANGLES, INDICES_COUNT, gl.UNSIGNED_SHORT, 0)

    requestAnimationFrame(loop)
  }

  loop()

}

main()