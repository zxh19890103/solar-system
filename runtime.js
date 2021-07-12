// @ts-nocheck
function importAnyJS(scriptUrl) {
  return fetch(scriptUrl)
    .then(r => r.text())
    .then(scriptContent => {
      // shareMod.scriptContent = scriptContent
      // with (windowProxy) {
      //   eval(shareMod.scriptContent);
      // }
      eval(scriptContent);
      return { MD5 }
    })
}

const shareMod = {
  scriptContent: '',
  value: {
    hello: 'hall'
  }
}

const importAnyJsHandler = {
  set(obj, prop, value) {
    shareMod.value[prop] = value
  },
  get(obj, prop) {
    const { value } = shareMod
    return value[prop] === undefined ? window[prop] : value[prop]
  }
}

const windowProxy = new Proxy(window, importAnyJsHandler)

// eval has scope.
// with (windowProxy) {
//   eval(`var MD5 = 90;`);
// }

window.importAnyJS = importAnyJS