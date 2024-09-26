module.exports = {
  transform: {
    '^.+\\.m?[tj]sx?$': 'babel-jest',
    '^.+\\.svg$': '<rootDir>/src/test/svgTransform.ts',
  },
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '/e2e'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts(x)'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  modulePaths: ['<rootDir>/src/'],
  moduleDirectories: ['node_modules', 'utils', __dirname],
  setupFiles: ['dotenv/config'],
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|react-merge-refs))'],

  moduleNameMapper: {
    '^@aragon/ods$': '<rootDir>/node_modules/@aragon/ods',
    '^@aragon/ods-old(.*)$': '<rootDir>/src/@aragon/ods-old$1',
  },
};
