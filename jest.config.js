module.exports = {
  transform: {
    '^.+\\.m?[tj]sx?$': 'babel-jest',
    '^.+\\.svg$': '<rootDir>/svgTransform.ts',
  },
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts(x)'],
  setupFilesAfterEnv: ['<rootDir>/.jest/setup.ts'],
  modulePaths: ['<rootDir>/src/', '<rootDir>/.jest'],
  // moduleDirectories overrides default jest package lookup behavior
  // using this to include utils folder so jest is aware of where the test-utils file resides
  moduleDirectories: ['node_modules', 'utils', __dirname],
  setupFiles: ['dotenv/config'],
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|react-merge-refs))'],
};
