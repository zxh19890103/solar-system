// @ts-nocheck
function importAnyJS(scriptUrl) {
  return fetch(scriptUrl)
    .then(r => r.text())
    .then(scriptContent => {
      const mod = {
        scriptContent
      }
      const importAnyJsHanlder = {
        set: function (obj, prop, value) {
          mod[prop] = value
        },
        get: function (obj, prop) {
          return mod[prop] === undefined ? window[prop] : mod[prop]
        }
      }
      const context = new Proxy(window, importAnyJsHanlder)
      with (context) { eval(scriptContent); }
      return mod
    })
}

window.importAnyJS = importAnyJS