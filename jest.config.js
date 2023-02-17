module.exports = {
  testEnvironment: 'jsdom',
  rootDir: '.',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  },
  testMatch: ['**/__tests__/**/*.((t|j)s|(t|j)sx)']
}
