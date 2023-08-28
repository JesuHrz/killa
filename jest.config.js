module.exports = {
  testEnvironment: 'jsdom',
  rootDir: '.',
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  },
  testMatch: ['**/__tests__/**/*.((t|j)s|(t|j)sx)'],
  moduleNameMapper: {
    '^killa$': '<rootDir>/src',
    '^killa/core': '<rootDir>/src/core',
    '^killa/react': '<rootDir>/src/react',
    '^killa/deep-equals': '<rootDir>/src/utils/deep-equals',
    '^killa/constants': '<rootDir>/src/utils/constants',
    '^killa/helpers': '<rootDir>/src/utils/helpers',
    '^killa/persist': '<rootDir>/src/middleware/persist'
  }
}
