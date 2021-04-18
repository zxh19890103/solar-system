const fs = require("fs")
const https = require("https")
const path = require("path")
const { downloadHTML } = require("../../scripts/utils")

const wiki_names = [
  "Mercury_(planet)",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune"
]

const names = wiki_names.map(x => x)
names[0] = "Mercury"

const images = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Mercury_in_color_-_Prockter07-edit1.jpg/640px-Mercury_in_color_-_Prockter07-edit1.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/PIA23791-Venus-NewlyProcessedView-20200608.jpg/640px-PIA23791-Venus-NewlyProcessedView-20200608.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/640px-The_Earth_seen_from_Apollo_17.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/640px-OSIRIS_Mars_true_color.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/640px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/640px-Saturn_during_Equinox.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/640px-Uranus2.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg/640px-Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg"
]

let i = 0

/**
 * @param {string} html 
 */
const extractTextContent = (html) => {
  return html.replace(/(<\w+.*?>|<\/\w+>)/sig, "")
}

const matchFields = (html) => {
  const regx = /<tr><th scope="row".+?>(.+?)<\/th><td>(.+?)<\/td><\/tr>/sig
  const pairs = []
  let match = null
  while (match = regx.exec(html)) {
    const [, key, value] = match
    pairs.push([key, value])
  }
  return pairs
}

const download = (url, name) => {
  return new Promise((resolve, reject) => {
    console.log("img", url)
    https.get(url, {
    }, (res) => {
      const saveas = path.resolve(__dirname, `./planets-inf/${name}`)
      console.log("saveas", saveas)
      const writer = fs.createWriteStream(saveas)
      res.pipe(writer)
      res.on("error", reject)
      writer.on("close", resolve)
    }).on("error", reject)
  })
}

const process = async () => {
  const item = wiki_names[i]
  if (item === undefined) {
    console.log("ends")
    return
  }
  const html = await downloadHTML(`https://en.wikipedia.org/wiki/${item}`)
  const fields = matchFields(html)
  const data = fields.map(x => {
    return [extractTextContent(x[0]), extractTextContent(x[1])]
  })
  fs.writeFileSync(`./planets-inf/${names[i]}.json`, `
{
${data.filter(x => {
    return /mass|radius|inclination|helion|speed|semi/i.test(x[0])
  }).map(([key, value]) => {
    return `  "${key}": "${value.replace(/\s/g, "")}"`
  }).join(",\n")
    }
}
`)
  await download(images[i], names[i])
  i += 1
  process()
}

const extractData = (value) => {
  const match = /^([\d,×\.]+\d).*?((&#160;[a-zA-Z\/]+)+)/.exec(value)
  if (!match) return null
  const [, magnitude, unit] = match
  console.log(magnitude)
  let num = 0
  let uni = unit.replace(/&#160;/g, "")
  if (magnitude.includes("×")) {
    const [, basis, power] = /^([\d,\.]+\d)×10(\d+)$/u.exec(magnitude)
    num = parseFloat(basis.replace(/,/g, "")) * Math.pow(10, + power)
  } else {
    num = parseFloat(magnitude)
  }
  if (uni.startsWith("million")) {
    num = num * 1000000
    uni = uni.substr(7)
  }
  return [num, uni]
}

/**
 * 
 * @param {RegExp} regx 
 * @param {string} source 
 */
const matchAll = (regx, source, ...groups) => {
  const all = []
  let match = null
  while (match = regx.exec(source)) {
    all.push(groups.map(g => {
      return match[g]
    }))
  }
  return all
}

const dataFromNineplanetsOrg = async () => {
  const html = await downloadHTML("https://nineplanets.org/planets-transparent-background/")
  const all = matchAll(
    /\/uploads\/\d+\/\d+\/([\-a-z0-9]+)\.(jpe?g|gif|png)/ig,
    html,
    0, 1, 2
  )
  const next = async () => {
    const one = all.shift()
    if (one === undefined) return
    const url = `https://nineplanets.org/wp-content${one[0]}`
    await download(url, `nineplanets-org/${one[1]}.${one[2]}`)
    next()
  }
  next()
}

const main = () => {
  const obj = {}
  names.forEach(name => {
    const data = require(`./planets-inf/${name}.json`)
    const inf = obj[name] = {}
    for (const key in data) {
      const mu = extractData(data[key])
      if (mu) {
        inf[key] = mu
      }
    }
  })

  fs.writeFileSync("./canvas-uni-8.ts", `
  export default ${JSON.stringify(obj)}
  `)
}

dataFromNineplanetsOrg()