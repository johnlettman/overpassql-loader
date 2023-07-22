import path from 'path';
import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  roots: [path.join(__dirname, 'src')],

  preset: 'ts-jest',
  testEnvironment: 'node',

  coverageDirectory: 'coverage',

  transform: { '^.+\\.(ts|tsx)$': 'ts-jest' },
  testPathIgnorePatterns: ['lib'],
  coveragePathIgnorePatterns: ['lib'],
};

export default config;
