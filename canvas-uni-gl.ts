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

function initBuffers(gl: WebGLRenderingContext) {

  // Create a buffer for the square's positions.

  const positionBuffer = gl.createBuffer()

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // Now create an array of positions for the square.

  const positions = [
    1.0, 1,
    -1.0, 1.0,
    1.0, -1.0,
    -1.0, -1.0,
  ]

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW)

  return {
    position: positionBuffer,
  }
}

function drawScene(gl: WebGLRenderingContext, programInfo, buffers) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)  // Clear to black, fully opaque
  gl.clearDepth(1.0)                 // Clear everything
  gl.enable(gl.DEPTH_TEST)           // Enable depth testing
  gl.depthFunc(gl.LEQUAL)            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180   // in radians
  const aspect = gl.canvas.width / gl.canvas.height
  const zNear = 0.1
  const zFar = 100.0
  const projectionMatrix = mat4.create()

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
    fieldOfView,
    aspect,
    zNear,
    zFar)

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create()
  mat4.translate(modelViewMatrix,     // destination matrix
    modelViewMatrix,     // matrix to translate
    [-0.0, 0.0, -100.0])  // amount to translate

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 2  // pull out 2 values per iteration
    const type = gl.FLOAT    // the data in the buffer is 32bit floats
    const normalize = false  // don't normalize
    const stride = 0         // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0         // how many bytes inside the buffer to start from
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset)
    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition)
  }

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program)

  // Set the shader uniforms

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix)
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix)

  {
    const offset = 0
    const vertexCount = 4
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
  }
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

const main_legacy = () => {

  const canvasElement = document.createElement("canvas")
  canvasElement.width = window.innerWidth
  canvasElement.height = window.innerHeight
  canvasElement.style.margin = "10px"
  document.documentElement.style.backgroundColor = "white"
  document.body.appendChild(canvasElement)
  const gl = canvasElement.getContext("webgl")

  const vsSource = `
  attribute vec4 aVertexPosition;
  
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  
  void main() {
    // gl_Position = aVertexPosition;
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
  `

  const fsSource = `
  void main() {
    gl_FragColor = vec4(.9, .5, .4, 1.0);
  }
  `

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource)
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  }

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl)

  // Draw the scene
  drawScene(gl, programInfo, buffers)
}

const main = () => {
  const [gl, w, h] = setUpGLContext()

  const vsCode = `
  attribute vec4 aVertex;
  attribute vec4 aColor;
  uniform mat4 mAnyMat;

  varying lowp vec4 vColor;

  void main() {
    gl_Position = mAnyMat * aVertex;
    vColor = aColor;
  }
  `
  const fsCode = `
  varying lowp vec4 vColor;
  void main() {
    gl_FragColor = vColor;
  }
  `

  const program = initShaderProgram(gl, vsCode, fsCode)

  const vetices = new Float32Array([
    0, 0, 0, 1,
    1, 1, 0, 1,
    1, 0, 0, 1
  ])
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, vetices, gl.STATIC_DRAW)
  const attrVertexLoc = gl.getAttribLocation(program, 'aVertex')
  gl.vertexAttribPointer(
    attrVertexLoc,
    4,
    gl.FLOAT,
    false,
    0,
    0
  )
  gl.enableVertexAttribArray(attrVertexLoc)

  const colors = new Float32Array([
    1, 0, 0, 1,
    0, 1, 0, 1,
    0, 0, 1, 1
  ])
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW)
  const attrColorLoc = gl.getAttribLocation(program, 'aColor')
  gl.vertexAttribPointer(
    attrColorLoc,
    4,
    gl.FLOAT,
    false,
    0,
    0
  )
  gl.enableVertexAttribArray(attrColorLoc)

  gl.useProgram(program)

  const mat = glMatrix.mat4.create()

  const uniLoc = gl.getUniformLocation(program, "mAnyMat")

  const draw = () => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)  // Clear to black, fully opaque
    gl.clearDepth(1.0)                 // Clear everything
    gl.enable(gl.DEPTH_TEST)           // Enable depth testing
    gl.depthFunc(gl.LEQUAL)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.uniformMatrix4fv(uniLoc, false, mat)
    glMatrix.mat4.rotateZ(
      mat,
      mat,
      Math.PI * .001
    )

    gl.drawArrays(gl.TRIANGLES, 0, 3)

    requestAnimationFrame(draw)
  }

  draw()

}

main()