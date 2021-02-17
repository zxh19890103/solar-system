var WORKER_SCRIPT_URL = "/3d/loop.ts"
var GLMATRIX_SCRIPT_URL = "/npm/gl-matrix/gl-matrix.js"

if (globalThis) {
  globalThis.WORKER_SCRIPT_URL = WORKER_SCRIPT_URL
  globalThis.GLMATRIX_SCRIPT_URL = GLMATRIX_SCRIPT_URL
}