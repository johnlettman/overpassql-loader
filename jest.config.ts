import type {JestConfigWithTsJest} from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  coverageDirectory: 'coverage',
  
  testPathIgnorePatterns: ['lib'],
  coveragePathIgnorePatterns: ['lib']
};

export default config;