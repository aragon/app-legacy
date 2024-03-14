module.exports = {
  transform: {
    '^.+\\.m?[tj]sx?$': 'babel-jest',
    '^.+\\.svg$': '<rootDir>/src/test/svgTransform.ts',
  },
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts(x)'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  modulePaths: ['<rootDir>/src/'],
  // moduleDirectories overrides default jest package lookup behavior
  // using this to include utils folder so jest is aware of where the test-utils file resides
  moduleDirectories: ['node_modules', 'utils', __dirname],
  setupFiles: ['dotenv/config'],
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|react-merge-refs))'],
};
