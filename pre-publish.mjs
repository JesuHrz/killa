import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

const version = pkg.version

const prePublish = () => {
  try {
    const readmePath = path.join(process.cwd(), 'README.md')
    const readmeFile = fs.readFileSync(readmePath, 'utf8')
    const updatedFile = readmeFile.replaceAll(
      /\killa@([^/]+)/g,
      `killa@${version}`
    )

    fs.writeFileSync(readmePath, updatedFile)
  } catch (err) {
    console.error('Error when trying to update the README.md', err)
  }
}

prePublish()
