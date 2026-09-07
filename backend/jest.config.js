module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.test.js',
    '**/whitebox-tests/**/*.test.js',
    '**/bva-tests/**/*.test.js'
  ],
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 10000,
  collectCoverageFrom: [
    'src/controllers/categoryController.js',
    'src/controllers/productController.js',
    'src/middlewares/authMiddleware.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html']
};

