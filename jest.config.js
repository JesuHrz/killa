module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  transform: {
    '^.+\\.js?$': ['@swc/jest']
  },
  testMatch: ['**/__tests__/**/*.js']
}
