import { Config } from "jest"

const config: Config = {
    preset: "ts-jest",//uses ts-jest for TypeScript support
    testEnvironment: "node", //specifies the environment in which the tests will run
    verbose: true, //shows individual test results

    //collectCoverage
    collectCoverage: true, //enables code coverage collection
    coverageDirectory: "coverage", //specifies the output directory for coverage reports
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts' //specifies which files to include for coverage
    ]
}

export default config