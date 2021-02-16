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

const {
  mat4,
  vec3
} = glMatrix

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

  return [
    img.naturalWidth,
    img.naturalHeight
  ]
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

  const BODY_MAPS = {
    earth: "/maps/earthmap1k.jpg",
    moon: "/maps/moonmap1k.jpg",
    jupiter: "/maps/jupitermap.jpg",
    mars: "/maps/mars_1k_color.jpg",
    neptune: "/maps/Neptune1.jpg",
    mercury: "/maps/merc_diff.jpg",
    saturn: "/maps/saturnmap.jpg",
    uranus: "/maps/uranusmap.jpg",
    venus: "/maps/venusmap.jpg"
  }

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

  const createMVPMatrices = () => {

    const [local, uniformLocal] = defineUniformMatrix4fv("local")
    const [model, uniformModel] = defineUniformMatrix4fv("model")
    const [view, uniformView] = defineUniformMatrix4fv("view")
    const [projection, uniformProj] = defineUniformMatrix4fv("projection")

    // const [normal, uniformNormal] = defineUniformMatrix4fv("faceNormal")

    mat4.lookAt(
      view,
      [0, 8000, 2000],
      [0, 0, 0],
      [0, 0, 1])

    mat4.perspective(
      projection,
      Math.PI * .8,
      w / h,
      1,
      800000.0
    )

    uniformView()
    uniformProj()
    uniformModel()

    return {
      rotate: () => {
        mat4.rotate(
          local,
          local,
          Math.PI * .005,
          [0, .4, 1]
        )
        // mat4.translate(
        //   model,
        //   model,
        //   [0, 1, 0]
        // )
        uniformLocal()
        // uniformModel()
        // mat4.invert(normal, model)
        // mat4.transpose(normal, normal)
        // uniformNormal()
      }
    }
  }

  const makeVertex = (lat: number, lon: number): ReadonlyVec3 => {
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

  const [gl, w, h] = setUpGLContext()
  const [imgW, imgH] = await loadTexture(gl, BODY_MAPS.mars)
  const vsCode = await loadRemoteShaderCode("/shaders/vertex.glsl")
  const fsCode = await loadRemoteShaderCode("/shaders/fragment.glsl")

  const { PI, cos, sin } = Math
  const HALF_PI = PI / 2
  const DOUBLE_PI = 2 * PI

  const vertices: number[] = []
  const normals: number[] = []
  const texCoords: number[] = []
  const indices: number[] = []
  const colors: number[] = []
  // M is the latitudes' count, it's Y
  // N is the longitudes' count. it's X
  const M = 100
  const N = 100
  const R = 6371 // km
  console.log(M, N)

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

      const normal = vec3.create()
      vec3.normalize(normal, makeVertex(lat + .5, lon + .5))
      normals.push(
        ...normal,
        ...normal,
        ...normal,
        ...normal
      )

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

  defineFloat32Attrib(
    normals,
    "aVertexNormal",
    3
  )

  const indicesBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

  gl.useProgram(program)

  gl.activeTexture(gl.TEXTURE0)
  gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0)

  const { rotate } = createMVPMatrices()

  const INDICES_COUNT = indices.length

  defineUniform3fv(
    "uAmbientLight",
    [.4, .4, .5]
  )

  defineUniform3fv(
    "uDirectionalLightColor",
    [1, 1, 1]
  )

  defineUniform3fv(
    "uLightDirection",
    [0, 0, 1]
  )

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