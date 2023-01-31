const path = require('path')
const glob = require('glob')
const esbuild = require('esbuild')

const buildForESMAndCJS = async ({ format, ...options }) => {
  const entryPoints = glob.sync(path.resolve(process.cwd(), 'src/**/*.js'))

  const result = await esbuild.build({
    entryPoints,
    packages: 'external',
    outdir: `dist/${format}`,
    format,
    platform: 'node',
    ...options
  })

  console.log(`Build for ${format.toUpperCase()} 🚀`, result)
}

const buildForBrowser = async () => {
  const result = await esbuild.build({
    entryPoints: ['./src/index.js'],
    bundle: true,
    outfile: 'dist/killa.min.js',
    minify: true,
    globalName: 'window.killa',
    platform: 'browser',
    format: 'iife',
    target: [
      'chrome58',
      'edge16',
      'firefox57',
      'safari11'
    ]
  })

  console.log('Build for Browser 🚀', result)
}

const init = async () => {
  buildForESMAndCJS({ format: 'esm' })
  buildForESMAndCJS({ format: 'cjs' })
  buildForBrowser()
}

init()
