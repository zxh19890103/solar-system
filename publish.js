const path = require("path")
const fs = require("fs")

const map = {
  "./dist/3d/.*.js": "../solar-system-site/scripts/",
  // "./shaders/.*.glsl": "../solar-system-site/shaders/",
  // "../node_modules/gl-matrix/gl-matrix-min.js": "../solar-system-site/scripts/",
  "./style.css": "../solar-system-site/",
  // "./planets-inf/maps/.*.jpg": "../solar-system-site/maps/",
  // "./planets-inf/nineplanets-org/.*.(jpe?g|png)": "../solar-system-site/nineplanets-org"
}

for (const [from, to] of Object.entries(map)) {
  const filenamepattern = new RegExp(path.basename(from))
  const dirname = path.dirname(from)
  const dir = fs.opendirSync(dirname)
  /**
   * @type {fs.Dirent}
   */
  let dirent = null
  while (dirent = dir.readSync()) {
    if (!filenamepattern.test(dirent.name)) continue
    const frompath = path.join(dirname, dirent.name)
    const topath = path.join(to, dirent.name)
    if (dirname.includes("3d")) {
      const content = fs.readFileSync(frompath, "utf-8")
      fs.writeFileSync(topath, content.replace(
        /import\s(.+)\sfrom\s"([\w\.\-\/]+)";/g,
        (g0, g1, g2) => {
          return `import ${g1} from "${g2}.js"`
        }
      ))
    } else {
      fs.copyFileSync(frompath, topath)
    }
  }
}