const path = require('path')
const glob = require('glob')
const esbuild = require('esbuild')
// const { aliasPath } = require('esbuild-plugin-alias-path')

const buildForESM = async () => {
  const entryPoints = glob.sync(path.resolve(process.cwd(), 'src/**/*.js'))

  const result = await esbuild.build({
    entryPoints,
    packages: 'external',
    outdir: 'dist/esm',
    format: 'esm'
    // plugins: [
    //   aliasPath({
    //     alias: {
    //       'killa/core': './src/core.js'
    //     }
    //   })
    // ]
  })

  console.log(result)
}

const buildForCJS = async () => {
  const entryPoints = glob.sync(path.resolve(process.cwd(), 'src/**/*.js'))

  const result = await esbuild.build({
    entryPoints,
    packages: 'external',
    outdir: 'dist/cjs',
    format: 'cjs'
  // plugins: [
  //   aliasPath({
  //     alias: {
  //       'killa/core': './src/core.js'
  //     }
  //   })
  // ]
  })

  console.log(result)
}

const buildForBrowser = async () => {
  const result = await esbuild.build({
    entryPoints: ['./src/index.js'],
    bundle: true,
    outfile: 'dist/killa.min.js',
    minify: true,
    globalName: 'window.killa',
    format: 'iife',
    target: [
      'chrome58',
      'edge16',
      'firefox57',
      'safari11'
    ]
  })

  console.log(result)
}

const init = async () => {
  buildForESM()
  buildForCJS()
  buildForBrowser()
}

init()
