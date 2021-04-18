const fs = require("fs")
const https = require("https")
const path = require("path")

const names = require("./urls")

const createUrl = (name) => {
  return `https://nasa3d.arc.nasa.gov/shared_assets/images/${name}/${name}.jpg.zip`
}

const down = (name) => {
  return new Promise((resolve, reject) => {
    console.log("zip", name)
    https.get(createUrl(name), {
    }, (res) => {
      const saveas = path.resolve(__dirname, `../nasa3d/${name}.zip`)
      console.log("saveas", saveas)
      const writer = fs.createWriteStream(saveas)
      res.pipe(writer)
      res.on("error", reject)
      writer.on("close", resolve)
    }).on("error", reject)
  })
}

const main = () => {
  // console.log(names)
  let i = 3
  const loop = async () => {
    const name = names[i++]
    if (name === undefined) return
    await down(name)
    loop()
  }

  loop()
}

main()