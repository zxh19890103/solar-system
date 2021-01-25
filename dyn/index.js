const https = require("https")
const ce = require("./ce")
// https://eyes.nasa.gov/assets/dynamic/dynamo/sc_maven/ori/171.dyn

function toArrayBuffer(buf) {
  var ab = new ArrayBuffer(buf.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

const main = () => {
  https.get(
    `https://eyes.nasa.gov/assets/dynamic/dynamo/sc_maven/ori/171.dyn`,
    {
      headers: {
        "Referer": "https://eyes.nasa.gov/apps/orrery/"
      }
    },
    (res) => {
      res.on("data", (chunk) => {
        new ce(toArrayBuffer(chunk))
      })
    }
  ).end()
}

main()