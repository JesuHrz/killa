import path from 'path'
import { glob } from 'glob'
import esbuild from 'esbuild'
import { dtsPlugin } from 'esbuild-plugin-d.ts'

const buildForCustomEnvironment = async ({
  format = 'cjs',
  isDev = false,
  ...options
} = {}) => {
  console.log(`\n🔄 Start building for ${format}`)

  const entryPoints = glob.sync(path.join(process.cwd(), 'src/**/*.ts'))

  try {
    const result = await esbuild.build({
      entryPoints,
      outdir: `dist/${format}`,
      packages: 'external',
      format,
      platform: 'node',
      target: ['node16'],
      sourcemap: isDev ? 'inline' : false,
      logLevel: isDev ? 'info' : 'warning',
      ...options
    })

    console.log(`\n✅ Build for ${format} successful 🚀`)
    return result
  } catch (_error) {
    console.error(`\n❌ Build failed for ${format}:`, _error)
    throw _error
  }
}

const buildForBrowser = async ({
  output,
  entryPoint,
  isDev = false,
  ...options
}) => {
  try {
    console.log(`\n🔄 Start building for browser: ${output}`)

    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      outfile: `dist/umd/${output}.min.js`,
      minify: !isDev,
      sourcemap: isDev ? 'inline' : false,
      globalName: `globalThis.${output}`,
      platform: 'browser',
      format: 'iife',
      target: ['chrome58', 'edge18', 'firefox57', 'safari11', 'node16'],
      logLevel: isDev ? 'info' : 'warning',
      ...options
    })

    console.log(`\n✅ Build for ${output} successful 🚀`)
  } catch (_error) {
    console.error(`\n❌ Build failed for ${output}:`, _error)
    throw _error
  }
}

const init = async (isDev = false) => {
  try {
    console.log(`⚒️  ${isDev ? 'Development' : 'Production'} build started...`)

    await buildForCustomEnvironment({
      format: 'cjs',
      plugins: [dtsPlugin()],
      isDev
    })

    await buildForCustomEnvironment({
      format: 'esm',
      plugins: [dtsPlugin()],
      isDev
    })

    await buildForCustomEnvironment({
      format: 'esm',
      outExtension: { '.js': '.mjs' },
      plugins: [dtsPlugin()],
      isDev
    })

    const allEntryPoints = [
      { output: 'killa', entryPoint: './src/core.ts' },
      {
        output: 'killaMiddlewares',
        entryPoint: './src/middleware'
      }
    ]

    for (let i = 0; i < allEntryPoints.length; i++) {
      await buildForBrowser({ ...allEntryPoints[i], isDev })
    }

    console.log('\n🎉 All builds completed successfully!')
  } catch (e) {
    console.error('\n💥 Build process failed!', e)
    process.exit(1)
  }
}

const isDev = process.argv.includes('--dev')

init(isDev)
