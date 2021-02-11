const fs = require("fs")
const http = require("http")

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

fs.watch("./3d", (event, name) => {
  if (event !== "change") return
  if (!name.endsWith(".ts")) return
  eventSource.emit({ reload: true })
})

fs.watch("./shaders", (event) => {
  if (event !== "change") return
  eventSource.emit({ reload: true })
})


const compileTs = (tsFile, saveAs) => {
  const source = fs.readFileSync(tsFile, "utf-8")
  const output = require("typescript").transpileModule(source, require("./tsconfig.json"))
  fs.writeFileSync(saveAs, output.outputText)
  console.log("gen", saveAs)
}

http.createServer((req, res) => {
  const url = req.url
  if (/\.(jpg|png|gif)$/.test(url)) {
    const [path, , ext] = /^\/(.+?)\.(jpg|png|gif)$/.exec(url)
    res.setHeader("Content-Type", `image/${ext}`)
    res.setHeader("Cache-Control", `private, max-age=2592000`)
    const filename = `./planets-inf/${path}`
    if (fs.existsSync(filename)) {
      const rs = fs.createReadStream(filename)
      rs.pipe(res)
    } else {
      const rs = fs.createReadStream("./planets-inf/Earth.jpg")
      rs.pipe(res)
    }
  } else if (/canvas-uni|3d/.test(url)) {
    const [, name] = /^\/(.*?)(\.ts)?$/.exec(url)
    const oriRresouce = `${name}.ts`
    res.setHeader("Content-Type", "text/javascript")
    const asJsResource = `./dist/${name}.js`
    const isJsExisting = fs.existsSync(asJsResource)
    let isExpired = false
    if (isJsExisting) {
      const statJs = fs.statSync(asJsResource)
      const statTs = fs.statSync(oriRresouce)
      isExpired = statTs.mtimeMs > statJs.ctimeMs
    }
    if (!isJsExisting || isExpired) {
      compileTs(oriRresouce, asJsResource)
    }
    const rs = fs.createReadStream(asJsResource)
    rs.pipe(res)
  } else if (/\.(css|json|html)$/.test(url)) {
    const [, name, ext] = /^\/(.*?)\.([a-z]+)$/.exec(url)
    const oriRresouce = `./${name}.${ext}`
    res.setHeader("Content-Type", getContentType(oriRresouce))
    const rs = fs.createReadStream(oriRresouce)
    rs.pipe(res)
  } else if (/^\/sse/.test(url)) {
    // event source
    // never close by sever
    if (/open$/.test(url)) {
      eventSource.set(res)
    } else {
      eventSource.emit({ reload: true })
      res.end("sent!")
    }
  } else if (/^\/npm\//.test(url)) {
    const [, name] = /^\/npm\/(.+)$/.exec(url)
    const resource = `../node_modules/${name}`
    if (fs.existsSync(resource)) {
      res.setHeader("Content-Type", getContentType(name))
      const rs = fs.createReadStream(resource)
      rs.pipe(res)
    } else {
      res.setHeader("Content-Type", "text/javascript")
      res.end(`console.error('file "${name}" is not found.')`)
    }
  } else if (/\.glsl$/.test(url)) {
    res.setHeader("Content-Type", "text/plain")
    const [, name] = /^\/(.+)\.glsl$/.exec(url)
    const rs = fs.createReadStream(`./${name}.glsl`)
    rs.pipe(res)
  } else {
    // fallback
    const rs = fs.createReadStream("./index.html")
    rs.pipe(res)
  }
}).listen(9001, ["localhost", "192.168.0.102"], () => {
  console.log("application is running on port 9001")
})