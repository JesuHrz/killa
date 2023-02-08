module.exports = {
  testEnvironment: 'jsdom',
  rootDir: '.',
  transform: {
    '^.+\\.js?$': ['@swc/jest']
  },
  testMatch: ['**/__tests__/**/*.js']
}
