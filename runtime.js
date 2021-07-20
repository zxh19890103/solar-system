// @ts-nocheck
function importAnyJS(scriptUrl) {
  return fetch(scriptUrl)
    .then(r => r.text())
    .then(scriptContent => {
      const mod = {}
      // for umd module
      const scope = new Function(scriptContent)
      scope.call(mod)
      return mod
    })
}

globalThis.importAnyJS = importAnyJS