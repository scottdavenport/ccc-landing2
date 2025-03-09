/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
    }],
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],
  collectCoverageFrom: [
    'app/api/**/*.ts',
    '!**/*.d.ts',
  ],
  coverageReporters: ['text', 'lcov'],
};

module.exports = config; 