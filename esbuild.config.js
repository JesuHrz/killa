const path = require('path')
const glob = require('glob')
const esbuild = require('esbuild')

const buildForCustomEnvironment = async ({ format = 'cjs', outdir = 'dist/', ...options }) => {
  const entryPoints = glob.sync(path.resolve(process.cwd(), 'src/**/*.js'))

  const result = await esbuild.build({
    entryPoints,
    outdir,
    packages: 'external',
    format,
    platform: 'node',
    target: [
      'node12'
    ],
    ...options
  })

  console.log('Build for Custom environment 🚀', result)
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
      'safari11',
      'node12'
    ]
  })

  console.log('Build for Browser 🚀', result)
}

const init = async () => {
  buildForCustomEnvironment()
  buildForBrowser()
}

init()
