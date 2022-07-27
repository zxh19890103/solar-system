const fs = require("fs")
const ts = require("typescript")
const path = require("path")
const tsconfig = require("./tsconfig.json")

const compileTs = (entryFile) => {
  console.log("compile", entryFile)
  setReferer(path.dirname(entryFile))
  const sourceFile = ts.createSourceFile(
    entryFile,
    fs.readFileSync(entryFile).toString(),
    ts.ScriptTarget.ESNext
  )

  let input = ""
  ts.forEachChild(sourceFile, (node) => {
    if (node.kind === ts.SyntaxKind.ImportDeclaration) {
      input += transformTSImport(node, sourceFile)
    } else {
      const text = node.getText(sourceFile)
      input += text + "\n"
    }
  })

  const output = ts.transpile(input, tsconfig.compilerOptions)

  jsFiles.set(entryFile, {
    ctimeMs: Date.now(),
    content: output,
  })
}

/**
 *
 * @param {ts.Node} node
 * @param {ts.SourceFile} sourceFile
 */
const transformTSImport = (node, sourceFile) => {
  let importStatement = ""
  for (const child of node.getChildren(sourceFile)) {
    switch (child.kind) {
      case ts.SyntaxKind.StringLiteral: {
        /**
         * @type {string}
         */
        const text = child.text
        const importFrom = tsResolve(text, REFERER)
        if (importFrom) {
          if (typeof importFrom === "string")
            importStatement += "'" + importFrom + "' "
          else {
            if (importFrom.module) {
              importStatement += "'" + importFrom.from + "' "
            } else {
              // it's not a module.
              return importStatement
                .replace("import ", "const ")
                .replace(
                  "from ",
                  `= await importAnyJS("${importFrom.from}"); \n`
                )
            }
          }
        } else {
          return `console.warn("Path ${text} is not there!");`
        }
        break
      }
      default:
        importStatement += child.getFullText(sourceFile) + " "
        break
    }
  }
  return importStatement + "\n"
}

/**
 * resovle a dep resource according to refer. it will return the specified file identifier, which can be require in refer.
 * @param {string} dep the dep: 1. absolute path; 2. named path; 3. relative path
 * @param {string} refer is an absolute path of .ts file.
 */
const tsResolve = (dep, refer) => {
  //////// break
  if (dep.startsWith("three/examples/jsm")) {
    const modulepath = require.resolve(dep, {
      paths: [path.join(__dirname, "./warehouse")],
    })
    // http://localhost:9001/Users/singhijohn/WorkSpace/solar-system/warehouse/node_modules/three/examples/jsm/controls/ArcballControls.js/
    return "/" + path.relative(__dirname, modulepath)
  }

  // it's npm package
  if (/^\w+$/.test(dep)) {
    const mainfile = require.resolve(dep, {
      paths: [refer, path.join(__dirname, "./warehouse")],
    })
    const moduleFile = tsResolvePackage(
      mainfile.replace(new RegExp(`/${dep}.*`), `/${dep}/`)
    )
    if (moduleFile) return moduleFile
  }

  // it's absolute Or relative path.
  if (!/^\/|\./.test(dep)) {
    return null
  }

  if (dep.endsWith(".ts")) return dep

  const abspath = path.join(refer, dep)

  if (fs.existsSync(abspath + ".ts")) {
    return dep + ".ts"
  }

  // as a folder
  if (fs.existsSync(abspath)) {
    const indexFile = path.join(abspath, "index.ts")
    if (fs.existsSync(indexFile)) {
      // Warning! join delete the relative symbol of path.
      return dep + "/index.ts"
    }

    const moduleFile = tsResolvePackage(abspath)
    if (moduleFile) return moduleFile
  }

  return null
}

const tsResolvePackage = (packageDir) => {
  const packageFile = path.join(packageDir, "package.json")
  if (!fs.existsSync(packageFile)) return null
  const { main, module } = require(packageFile)
  if (module) {
    return {
      from: normalizeDepUri(path.join(packageDir, module)),
      module: true,
    }
  }
  if (main) {
    return { from: normalizeDepUri(path.join(packageDir, main)), module: false }
  }
  return null
}

const normalizeDepUri = (dep) => {
  const relativePath = "/" + path.relative(ROOT_DIR, dep)
  return relativePath
}

/**
 * @param {string} rootDir
 */
const emitScriptsHTMLTags = () => {
  const scriptTags = []
  for (const script of globalImportScripts) {
    scriptTags.push(`registerGlobalScript("${script}");\n`)
  }
  globalImportScripts.clear()
  return scriptTags.join("")
}

const readScriptContent = (url) => {
  const diskSrc = path.join(ROOT_DIR, url)
  if (!fs.existsSync(diskSrc)) {
    return `console.error(404, '${diskSrc}')`
  }
  const stat = fs.statSync(diskSrc)
  const jsFile = jsFiles.get(diskSrc)
  if (!jsFile || stat.mtimeMs > jsFile.ctimeMs) {
    compileTs(diskSrc)
  }
  return jsFiles.get(diskSrc).content
}

const test = () => {
  console.log("test >>>")
  setRootDir(__dirname)
  // console.log('>>> root dir:', __dirname)
  // compileTs('./module.ts')
  // console.log(jsFiles.get('./module.ts'))
  // console.log(emitScriptsHTMLTags(__dirname))
  console.log(compileTs("sys-n/app.ts"))
  // console.log(...jsFiles)
  return 0
}

const globalImportScripts = new Set()
const jsFiles = new Map()
let ROOT_DIR = "/"
const setRootDir = (value) => {
  ROOT_DIR = value
}
let REFERER = ""
const setReferer = (value) => {
  REFERER = value
}

if (require.main.filename === __filename) {
  test()
}

module.exports = {
  setRootDir,
  setReferer,
  compileTs,
  emitScriptsHTMLTags,
  readScriptContent,
}
