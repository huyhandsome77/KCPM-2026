module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.test.js',
    '**/whitebox-tests/**/*.test.js',
    '**/bva-tests/**/*.test.js',
    '**/stateTransition-tests/**/*.test.js'
  ],
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 10000,
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/middlewares/**/*.js',
    '!src/models/**',
    '!src/configs/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html']
};

