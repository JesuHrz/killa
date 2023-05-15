const path = require('path')
const glob = require('glob')
const esbuild = require('esbuild')

const buildForCustomEnvironment = async ({
  format = 'cjs',
  ...options
} = {}) => {
  const entryPoints = glob.sync(path.join(process.cwd(), 'src/**/*.ts'))

  const result = await esbuild.build({
    entryPoints,
    outdir: `dist/${format}`,
    packages: 'external',
    format,
    platform: 'node',
    target: ['node12'],
    ...options
  })

  console.log(`Build for ${format.toUpperCase()} 🚀`, result)
}

const buildForBrowser = async ({ output, entryPoint, ...options }) => {
  const result = await esbuild.build({
    entryPoints: [entryPoint],
    bundle: true,
    outfile: `dist/umd/${output}.min.js`,
    minify: true,
    globalName: `globalThis.${output}`,
    platform: 'browser',
    format: 'iife',
    target: ['chrome58', 'edge18', 'firefox57', 'safari11', 'node12'],
    ...options
  })

  console.log('Build for Browser 🚀', result)
}

const init = async () => {
  await buildForCustomEnvironment({ format: 'cjs' })
  await buildForCustomEnvironment({ format: 'esm' })

  const allEntryPoints = [
    { output: 'killa', entryPoint: './src/core.ts' },
    {
      output: 'killaMiddlewares',
      entryPoint: './src/middleware'
    }
  ]

  for (let i = 0; i < allEntryPoints.length; i++) {
    await buildForBrowser(allEntryPoints[i])
  }
}

init()
