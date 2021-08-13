const fs = require("fs")
const http = require("http")
const path = require("path")
const tsCompiler = require('./tscompiler')
const { LAST_HANDLER } = require('./last-handler')
/**
 * @typedef {(req: http.IncomingMessage, res: http.ServerResponse, next: () => Promise<void>) => Promise<void>} MyRouteHandler
 * @typedef {Object} MyRoute
 * @property {RegExp} regx
 * @property {MyRouteHandler[]} handlers
 */

/**
 * @typedef {Object} HTTP_THREAD_CONTEXT
 * @property {http.IncomingMessage} req
 * @property {http.ServerResponse} res
 * @property {Symbol} $is
 * @property {() => MyRouteHandler} getHandler
 * @property {() => Promise<void>} nextFn
 */

/**
 * 
 * @param {string} url 
 * @returns {string}
 */
const getContentType = (url) => {
  if (url.endsWith(".js")) return "text/javascript"
  if (url.endsWith(".json")) return "application/json"
  if (url.endsWith(".css")) return "text/css"
  if (url.endsWith(".html")) return "text/html"
  return "text/plain"
}

const eventSource = {
  /**
   * @type {Set<http.ServerResponse>}
   */
  responses: new Set(),
  /**
   * @param {http.ServerResponse} val 
   */
  set(val) {
    val.on("close", () => {
      this.responses.delete(val)
    })
    val.setHeader("Content-Type", "text/event-stream")
    val.setHeader("Connection", "keep-alive")
    val.setHeader("Cache-Control", "no-cache")
    val.setHeader('Transfer-Encoding', 'identity')
    val.writeHead(200)
    val.flushHeaders()
    val.write(":ok\n\n")
    this.responses.add(val)
  },
  emit(payload) {
    const now = Date.now()
    const event = `
id: ${now.toString(16)}
type: message
data: ${JSON.stringify(payload)}
    `.trim() + '\n\n'
    this.responses.forEach(res => {
      res.write(event)
    })
  }
}

fs.watch("./sys-n", {
  recursive: true
}, (event, name) => {
  if (event !== "change") return
  if (!name.endsWith(".ts")) return
  eventSource.emit({ reload: true })
})

/**
 * @type {Array<MyRoute>}
 */
const routes = []

/**
 * 
 * @param {RegExp} regx 
 * @param {(MyRouteHandler | boolean)[]} handlers
 */
const route = (regx, ...handlers) => {
  const last = handlers.pop()
  let final = []
  const isLastBoolean = typeof last === 'boolean'
  if (isLastBoolean) {
    if (last === true) {
      final = [LAST_HANDLER, ...handlers]
    } else {
      final = [...handlers]
    }
  } else {
    final = [LAST_HANDLER, ...handlers, last]
  }
  routes.push(
    {
      regx: regx,
      handlers: final
    }
  )
}

const HTTP_THREAD_CONTEXT = Symbol('http thread context')

/**
 * @param {http.IncomingMessage} req 
 * @param {http.ServerResponse} res 
 */
const createThread = (req, res) => {
  // console.log('create thread for', req.url)
  const route = routes.find(x => x.regx.test(req.url))
  if (!route) {
    console.log('no route found.')
    return
  }
  const handlers = route.handlers.map(h => h)
  let handler = null
  /**
   * @type {HTTP_THREAD_CONTEXT}
   */
  const context = {
    $is: HTTP_THREAD_CONTEXT,
    req,
    res,
    getHandler: () => handler,
    nextFn: () => {
      handler = handlers.shift()
      if (!handler) {
        handler = null
        return
      }
      return fireRouteHandler.call(context)
    }
  }

  context.nextFn()
}

/**
 * @this {HTTP_THREAD_CONTEXT}
 * @returns {void}
 */
async function fireRouteHandler() {
  if (this.$is !== HTTP_THREAD_CONTEXT) {
    throw new Error('`this` is not HTTP_THREAD_CONTEXT')
  }
  const {
    req,
    res,
    getHandler,
    nextFn
  } = this
  const handler = getHandler()
  await handler(req, res, nextFn)
  await nextFn()
}

//#region routes

// image
route(
  /\.(jpg|png|gif|webp)$/,
  async (req, res, next) => {
    const [imgpath, , ext] = /^\/(.+?)\.(jpg|png|gif|webp)$/.exec(req.url)
    res.setHeader("Content-Type", `image/${ext}`)
    res.setHeader("Cache-Control", `private, max-age=2592000`)
    let filename = path.join(IMG_CONTENT_SERVE_AT, imgpath)
    if (!fs.existsSync(filename)) {
      filename = path.join(IMG_CONTENT_SERVE_AT, 'Earth.jpg')
    }
    await pipeFile(filename, res)
  }
)

// glsl
route(
  /\.glsl$/,
  async (req, res, next) => {
    res.setHeader("Content-Type", "text/plain")
    const [, name] = /^\/(.+)\.glsl$/.exec(req.url)
    const filename = path.join(TEXT_CONTENT_SERVE_AT, name)
    await pipeFile(filename, res)
  }
)

// js css html json ...
route(
  /\.(js|css|json|html)$/,
  async (req, res, next) => {
    const [, name, ext] = /^\/(.*?)\.([a-z]+)$/.exec(req.url)
    const filename = path.join(TEXT_CONTENT_SERVE_AT, `./${name}.${ext}`)
    res.setHeader("Content-Type", getContentType(filename))
    res.setHeader("Cache-Control", `private, max-age=2592000`)
    if (fs.existsSync(filename)) {
      await pipeFile(filename, res)
    } else {
      let txt = ''
      if (ext === 'js') txt = `console.error('404', '${filename}')`
      else if (ext === 'html') txt = '<h1 style="color: red">404</h1>'
      else if (ext === 'css') txt = 'html { background-color: red; }'
      else if (ext === 'json') txt = JSON.stringify({ code: 404 })
      res.end(txt)
    }
  }
)

// ts
route(
  /\.ts$/,
  (req, res, next) => {
    const [, name] = /^\/(.*?)\.ts$/.exec(req.url)
    res.setHeader("Content-Type", "text/javascript")
    const scriptContent = tsCompiler.readScriptContent(`${name}.ts`)
    res.write(scriptContent)
  }
)

const compution = require('./sys-n/compution')
let bufferTimes = 10
function nextbuffer() {
  const data = compution.compute(bufferTimes)
  eventSource.emit({ data })
  setTimeout(nextbuffer, 1000)
}

// sse
route(
  /^\/sse/,
  (req, res, next) => {
    // never close by sever
    if (/open$/.test(req.url)) {
      eventSource.set(res)
    } else {
      eventSource.emit({ reload: true })
      res.end("sent!")
    }
  },
  false
)

route(
  /^\/compution/,
  (req, res, next) => {
    if (/buffer$/.test(req.url)) {
      req.setEncoding('utf-8')
      req.on('data', (chunk) => {
        bufferTimes = JSON.parse(chunk)
        console.log(bufferTimes)
      })
    } else if (/init$/.test(req.url)) {
      req.setEncoding('utf-8')
      console.log('init')
      req.on('data', (chunk) => {
        compution.receive(JSON.parse(chunk))
        nextbuffer()
      })
    }
  }
)


// /
route(
  /^\//,
  async (req, res, next) => {
    const filename = path.join(TEXT_CONTENT_SERVE_AT, req.url)
    console.log(filename)
    if (fs.existsSync(filename)) {
      const stat = fs.statSync(filename)
      if (stat.isDirectory()) {
        const indexfile = path.join(filename, 'index.html')
        if (fs.existsSync(indexfile)) {
          await pipeFile(indexfile, res)
          return
        }
      } else if (stat.isFile()) {
        await pipeFile(filename, res)
        return
      }
    }
    res.writeHead(404)
    res.end()
  }
)

//#endregion

const delay = () => {
  console.log('delay for 4 seconds')
  return new Promise(r => {
    setTimeout(r, 4000)
  })
}

/**
 * 
 * @param {string} filepath 
 * @param {http.ServerResponse} res 
 * @returns {void}
 */
const pipeFile = (filepath, res) => {
  return new Promise((r, e) => {
    fs.createReadStream(filepath)
      .on('end', r)
      .on('error', e)
      .pipe(res, { end: false })
      .on('error', e)
  })
}

const TEXT_CONTENT_SERVE_AT = __dirname
const IMG_CONTENT_SERVE_AT = path.join(__dirname, './planets-inf')
tsCompiler.setRootDir(__dirname)

http.createServer(createThread)
  .listen(9001, "0.0.0.0", () => {
    console.log("application is running on port 9001")
  })