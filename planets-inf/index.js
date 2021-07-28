const fs = require('fs')
const path = require('path')

const writer = fs.createWriteStream(path.join(__dirname, './images.ts'), { encoding: 'utf-8', flags: 'w+' })

/**
 * 
 * @param {fs.Dir} dir 
 */
const iterDir = (context, dir) => {
  dir.read().then(dirent => {
    if (dirent === null) return
    if (dirent.isFile()) {
      const ext = path.extname(dirent.name)
      if (ext === '.jpg' || ext === '.png') {
        const name = path.join(context, dirent.name)
        writer.write(`export const ${name.replace(/[\/\.\-\(\)]/g, '_').replace(/^_\d*/, '').toUpperCase()} = "${name}"\n`)
      }
    } else if (dirent.isDirectory()) {
      openDir(path.join(context, dirent.name))
    }

    iterDir(context, dir)
  })
}

/**
 * 
 * @param {string} context 
 */
const openDir = (context) => {
  fs.opendir(
    path.join(__dirname, context)
    , (err, dir) => {
      if (err) throw err
      iterDir(context, dir)
    })
}

openDir("/")
