import { Config } from 'jest';

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    verbose: true,

    //collectCoverage
    collectCoverage: true, //enables code coverage collection
    coverageDirectory: "coverage", //specifies the output directory for coverage reports
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts' //specifies which files to include for coverage
    ]
};

export default config;
