

import { authenticateUser, product } from "../src/BasicUtils";

describe("BasicUtils test suite", () => {
    test("should return the product of two positive numbers", () => {
        const actual = product(3, 4);
        const expected = 12;
        expect(actual).toBe(expected);
    })
    //Matchers - toBe, toEqual, toBeLessThan, toBeGreaterThan, toBeLessThanOrEqual, toBeGreaterThanOrEqual, toBeCloseTo
    // A well written unit test should undergo the AAA phases
    it("should return the product 3 and 2", () => {
        const actual = product(3, 2);
        expect(actual).toBe(6);
        expect(actual).not.toBe(7);
        expect(actual).toEqual(6);
        expect(actual).toBeLessThan(10)
        expect(actual).toBeLessThanOrEqual(6)
        expect(actual).toBeGreaterThan(5)
        expect(actual).toBeGreaterThanOrEqual(6)
        expect(actual).toBeCloseTo(6.0)
    })

    it("user authentication test", () => {
        //ARRANGE
        const sut = authenticateUser; //system under test
        //ACT
        const actual = sut("deveLOPER", "dev"); //IAuthData
        //ASSERT
        expect(actual.usernameToLower).toBe("developer");
        //this will fail because of reference type Array
        // expect(actual.usernameCharacters).toBe(["d", "e", "v", "e", "L", "O", "P", "E", "R"]); 
        // use toEqual for reference types
        expect(actual.usernameCharacters).toEqual(["d", "e", "v", "e", "L", "O", "P", "E", "R"]);
        expect(actual.usernameCharacters).toContain("L");
        expect(actual.userDetails).toEqual({ name: "Developer", role: "admin" });
        expect(actual.isAuthenticated).toBeTruthy();
        //other matchers: toBeDefined, toBeUndefined, toBeNull, toBeTruthy, toBeFalsy
        expect(actual.userDetails).toBeDefined();
        expect(actual.userDetails).not.toBeUndefined();
        expect(actual.userDetails).not.toBeNull();

    })
})
// , while using the above way to write our tests, we are not separating tests. Whenever a matcher fails, the entire test will fail and this is not the best practice. Therefore, we need to understand the FIRST-U Principle

// FIRST-U Principle
// F - Fast - unit tests should run fast
// I - Isolated - unit tests should be isolated from each other
// R - Repeatable - unit tests should produce the same results every time they are run
// S - Self-validating - unit tests should be able to validate themselves i.e without human intervention
// T - Timely - unit tests should be written at the same time as the production code
// U - Unique - each unit test should test a unique aspect of the code

describe("FIRST-U Principle test suite", () => {

    it("should return the product of 5 and 4", () => {
        //ARRANGE
        const actual = product(5, 4);
        //ACT
        const expected = 20;
        //ASSERT
        expect(actual).toBe(expected);
    })
    //TODO- 
    describe("User Authentication Tests", () => {
        it("should convert username to lowercase", () => {
            //ARRANGE
            const sut = authenticateUser;
            //ACT
            const actual = sut("deveLOPER", "dev");
            //ASSERT
            expect(actual.usernameToLower).toBe("developer");
        });

        it("should split username into characters array", () => {
            //ARRANGE
            const sut = authenticateUser;
            //ACT
            const actual = sut("deveLOPER", "dev");
            //ASSERT
            expect(actual.usernameCharacters).toEqual(["d", "e", "v", "e", "L", "O", "P", "E", "R"]);
        });

        //what is a user enters -  'L', 'O', 'P', 'E', 'R', 'd', 'e', 'v', 'e'
        it("should contain specific characters in usernameCharacters array", () => {
            //ARRANGE
            const sut = authenticateUser;
            //ACT
            const actual = sut("deveLOPER", "dev"); //system under test
            //ASSERT
            // expect(actual.usernameCharacters).toContain("L");
            expect(actual.usernameCharacters).toEqual(expect.arrayContaining(['L', 'O', 'P']));
        });

        //truthy and falsy tests
        it("should authenticate valid user", () => {
            //ARRANGE
            const sut = authenticateUser;
            //ACT
            const actual = sut("deveLOPER", "dev");
            //ASSERT
            expect(actual.isAuthenticated).toBeTruthy();
            expect(actual.isAuthenticated).not.toBeFalsy();
        });
    })

})


import { UserNameToLowerCase } from "../src/BasicUtils"

// JEST hooks - beforeAll, afterAll, beforeEach, afterEach
describe.skip("JEST hooks test suite", () => {
    let username: string;

    beforeAll(() => {
        console.log("Starting JEST hooks test suite...");
    });

    beforeEach(() => {
        // simulate setup
        username = "deveLOPER";
        console.log("Username value:", username);
    });

    afterEach(() => {
        // simulate teardown
        username = "";
        console.log("Username value to be empty:", username);
    });

    afterAll(() => {
        console.log("Finished JEST hooks test suite.");
    });

    test("converts username to lowercase", () => {
        expect(UserNameToLowerCase(username)).toBe("developer");
    });

    test("throws when username is empty", () => {
        expect(() => UserNameToLowerCase("")).toThrow("Username cannot be empty");
    });
});


//Parameterized Tests in JEST
describe.only("Parameterized Tests in JEST", () => {
    test.each([
        [3, 4, 12],
        [5, 6, 30],
        [7, 8, 56],
        [2, 9, 18]
    ])("product(%i, %i) should return %i", (a, b, expected) => {
        expect(product(a, b)).toBe(expected);
    });

    it.each([
        ["deveLOPER", "developer"],
        ["KEMBOI", "kemboi"],
        ["JOHNDOE", "johndoe"],
        ["JaneDoe", "janedoe"]
    ])("UserNameToLowerCase(%s) should return %s", (input, expected) => {
        expect(UserNameToLowerCase(input)).toBe(expected);
    });
    it.todo("write more parameterized tests for authenticateUser function");

});

//Coverage Report in JEST

// /* istanbul ignore next */     -> used to ignore specific lines of code from coverage report
