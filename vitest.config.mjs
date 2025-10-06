import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      include: ['src/**/'],
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'text-summary']
    },
    dir: '__tests__',
    setupFiles: ['__tests__/setup.ts']
  },
  resolve: {
    alias: {
      'killa/core': path.resolve(__dirname, './src/core.ts'),
      'killa/react': path.resolve(__dirname, './src/react.ts'),
      'killa/deep-equals': path.resolve(
        __dirname,
        './src/utils/deep-equals.ts'
      ),
      'killa/constants': path.resolve(__dirname, './src/utils/constants.ts'),
      'killa/helpers': path.resolve(__dirname, './src/utils/helpers.ts'),
      'killa/persist': path.resolve(__dirname, './src/middleware/persist.ts'),
      killa: path.resolve(__dirname, './src/index.ts')
    }
  }
})
