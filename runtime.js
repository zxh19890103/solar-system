// @ts-nocheck
function importAnyJS(scriptUrl, exportAs = "T") {
  return new Promise((r, f) => {
    console.log("import: ", scriptUrl)
    const script = document.createElement("script")
    script.onerror = f
    script.onload = (e) => {
      r(window[exportAs])
      document.head.removeChild(script)
    }

    script.src = scriptUrl
    document.head.appendChild(script)
  })
}

globalThis.importAnyJS = importAnyJS

const __COMPUTION_RESULT_CALLBACKS__ = []
function computionResultJsonp(callback) {
  __COMPUTION_RESULT_CALLBACKS__.push(callback)
}

{
  const es = new EventSource("/sse-open")
  es.onmessage = (evt) => {
    const data = JSON.parse(evt.data)

    if (data.reload) {
      location.reload()
      return
    }

    const payload = JSON.parse(data.data)
    if (payload.buffer) {
      // phases["buffer"]()
    } else if (payload.init) {
      // phases["init"]()
    } else {
      for (const callback of __COMPUTION_RESULT_CALLBACKS__) {
        callback(payload)
      }
    }
  }
}
