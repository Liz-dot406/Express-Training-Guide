# Unit Testing Practices Guide

## Overview

This guide provides practical unit testing knowledge for developers at all levels. It covers essential testing concepts, Jest mocking strategies, and real-world testing patterns using a Node.js/TypeScript service layer as examples.

## 1. Core Testing Concepts

### Test Structure (AAA Pattern)

```typescript
it("should perform specific action", async () => {
    // ARRANGE - Setup test data and mocks
    const mockData = { id: 1, name: "Test User" };
  
    // ACT - Execute the function under test
    const result = await serviceFunction(mockData);
  
    // ASSERT - Verify expectations
    expect(result).toEqual(expectedOutput);
});
```

### Test Isolation Principles

- Each test should be independent
- Use `afterEach()` to clean up mocks
- Avoid shared state between tests

```typescript
describe("Service Test Suite", () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clean up all mocks after each test
    });
});
```

## 2. Jest Mocking Fundamentals

### Module Mocking

Mock entire modules at the top of your test file:

```typescript
// Mock external dependencies
jest.mock("../src/repositories/user.repository");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../src/mailer/mailer");
```

### Function Mocking Types

```typescript
// Mock with return value
(mockFunction as jest.Mock).mockResolvedValue(expectedResult);

// Mock with implementation
(mockFunction as jest.Mock).mockImplementation(() => "custom logic");

// Mock to throw error
(mockFunction as jest.Mock).mockRejectedValue(new Error("Test error"));
```

### Mock Assertions

```typescript
// Verify function was called
expect(mockFunction).toHaveBeenCalled();

// Verify call count
expect(mockFunction).toHaveBeenCalledTimes(1);

// Verify call arguments
expect(mockFunction).toHaveBeenCalledWith("expected", "arguments");
```

## 3. Testing Service Layer

### Testing CRUD Operations

#### Read Operations (List/Get)

```typescript
it("should return a list of users", async () => {
    // ARRANGE
    const mockUsers = [
        { userid: 1, first_name: "Alice", email: "alice@gmail.com" },
        { userid: 2, first_name: "Brian", email: "brian@gmail.com" }
    ];
    (userRepositories.getUsers as jest.Mock).mockResolvedValue(mockUsers);

    // ACT
    const users = await userServices.listUsers();

    // ASSERT
    expect(users).toEqual(mockUsers);
    expect(userRepositories.getUsers).toHaveBeenCalledTimes(1);
});
```

#### Create Operations

```typescript
it("should create user with hashed password and send verification email", async () => {
    // ARRANGE
    const mockUser = {
        first_name: "John",
        email: "john@gmail.com",
        password: "password123"
    };
  
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    (userRepositories.createUser as jest.Mock).mockResolvedValue({});
    (userRepositories.setVerificationCode as jest.Mock).mockResolvedValue({});
    (sendEmail as jest.Mock).mockResolvedValue(true);

    // ACT
    const result = await userServices.createUser(mockUser);

    // ASSERT
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(userRepositories.createUser).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalled();
    expect(result.message).toContain("user created successfully");
});
```

#### Update Operations

```typescript
it("should update user with hashed password", async () => {
    // ARRANGE
    const userId = 1;
    const updateData = { password: "newpassword123" };
  
    (userRepositories.getUserById as jest.Mock).mockResolvedValue({ userid: 1 });
    (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");
    (userRepositories.updateUser as jest.Mock).mockResolvedValue({ 
        message: "User updated successfully" 
    });

    // ACT
    const result = await userServices.updateUser(userId, updateData);

    // ASSERT
    expect(bcrypt.hash).toHaveBeenCalledWith("newpassword123", 10);
    expect(userRepositories.updateUser).toHaveBeenCalledWith(userId, updateData);
    expect(result.message).toEqual("User updated successfully");
});
```

#### Delete Operations

```typescript
it("should delete user if exists", async () => {
    // ARRANGE
    const userId = 1;
    (userRepositories.getUserById as jest.Mock).mockResolvedValue({ userid: 1 });
    (userRepositories.deleteUser as jest.Mock).mockResolvedValue({ 
        message: "User deleted successfully" 
    });

    // ACT
    const result = await userServices.deleteUser(userId);

    // ASSERT
    expect(userRepositories.getUserById).toHaveBeenCalledWith(userId);
    expect(userRepositories.deleteUser).toHaveBeenCalledWith(userId);
    expect(result.message).toEqual("User deleted successfully");
});
```

## 4. Mocking External Dependencies

### Database Layer Mocking

Mock repository functions to isolate service logic:

```typescript
// Mock successful database operations
(userRepositories.createUser as jest.Mock).mockResolvedValue({});
(userRepositories.getUserById as jest.Mock).mockResolvedValue(mockUser);
(userRepositories.updateUser as jest.Mock).mockResolvedValue(updatedUser);
```

### Third-Party Library Mocking

#### Bcrypt Mocking

```typescript
// Mock password hashing
(bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

// Mock password comparison
(bcrypt.compare as jest.Mock).mockResolvedValue(true); // Valid password
(bcrypt.compare as jest.Mock).mockResolvedValue(false); // Invalid password
```

#### JWT Mocking

```typescript
// Mock token generation
(jwt.sign as jest.Mock).mockReturnValue("mockJwtToken");

// Mock token verification
(jwt.verify as jest.Mock).mockReturnValue({ userId: 1, email: "test@gmail.com" });
```

#### Email Service Mocking

```typescript
// Mock email sending
(sendEmail as jest.Mock).mockResolvedValue(true);

// Mock email template generation
(emailTemplate.verify as jest.Mock).mockReturnValue("<p>Verification email</p>");
(emailTemplate.welcome as jest.Mock).mockReturnValue("<p>Welcome email</p>");
```

## 5. Testing Async Operations

### Authentication Flow Testing

```typescript
it("should return token and user info on successful login", async () => {
    // ARRANGE
    const mockUser = {
        userid: 1,
        first_name: 'John',
        email: 'john@gmail.com',
        password: 'hashedPassword'
    };
  
    (userRepositories.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mockJwtToken");

    // ACT
    const result = await userServices.loginUser("john@gmail.com", "password123");

    // ASSERT
    expect(userRepositories.getUserByEmail).toHaveBeenCalledWith("john@gmail.com");
    expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedPassword");
    expect(jwt.sign).toHaveBeenCalled();
    expect(result).toHaveProperty("token", "mockJwtToken");
    expect(result.user.email).toBe("john@gmail.com");
});
```

### Email Verification Testing

```typescript
it("should verify user with correct verification code", async () => {
    // ARRANGE
    const mockUser = {
        email: "john@gmail.com",
        verification_code: "123456",
        first_name: "John"
    };
  
    (userRepositories.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    (userRepositories.verifyUser as jest.Mock).mockResolvedValue({});
    (sendEmail as jest.Mock).mockResolvedValue(true);

    // ACT
    const result = await userServices.verifyUser("john@gmail.com", "123456");

    // ASSERT
    expect(userRepositories.getUserByEmail).toHaveBeenCalledWith("john@gmail.com");
    expect(userRepositories.verifyUser).toHaveBeenCalledWith("john@gmail.com");
    expect(sendEmail).toHaveBeenCalled();
    expect(result.message).toBe("User verified successfully");
});
```

## 6. Error Handling Tests

### Testing Invalid Input

```typescript
it("should throw error for invalid verification code", async () => {
    // ARRANGE
    const mockUser = {
        email: "john@gmail.com",
        verification_code: "123456"
    };
  
    (userRepositories.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

    // ACT & ASSERT
    await expect(userServices.verifyUser("john@gmail.com", "987654"))
        .rejects
        .toThrow("Invalid verification code");
});
```

### Testing Authentication Failures

```typescript
it("should throw error for invalid credentials", async () => {
    // ARRANGE
    const mockUser = { email: 'john@gmail.com', password: 'hashedPassword' };
    (userRepositories.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    // ACT & ASSERT
    await expect(userServices.loginUser("john@gmail.com", "wrongpassword"))
        .rejects
        .toThrow("Invalid credentials");
});
```

### Testing Missing Resources

```typescript
it("should throw error when user not found", async () => {
    // ARRANGE
    (userRepositories.getUserByEmail as jest.Mock).mockResolvedValue(null);

    // ACT & ASSERT
    await expect(userServices.verifyUser("nonexistent@gmail.com", "123456"))
        .rejects
        .toThrow("User not found");
});
```

## 7. Advanced Testing Patterns

### Testing Helper Functions

```typescript
it("should validate user existence before operations", async () => {
    // ARRANGE
    const nonExistentUserId = 999;
    (userRepositories.getUserById as jest.Mock).mockResolvedValue(null);

    // ACT & ASSERT
    await expect(userServices.updateUser(nonExistentUserId, {}))
        .rejects
        .toThrow("User not found");
      
    await expect(userServices.deleteUser(nonExistentUserId))
        .rejects
        .toThrow("User not found");
});
```

## 8. Best Practices

### Mock Management

```typescript
// Clear mocks after each test
afterEach(() => {
    jest.clearAllMocks();
});

// Reset mocks before each test (if needed)
beforeEach(() => {
    jest.resetAllMocks();
});
```

### Testing Edge Cases

```typescript
describe("Edge Cases", () => {
    it("should handle empty password gracefully", async () => {
        const userWithoutPassword = { email: "test@gmail.com" };
        // Test that password hashing is skipped
    });
  
    it("should handle email service failures", async () => {
        (sendEmail as jest.Mock).mockRejectedValue(new Error("Email service down"));
        // Test that user creation still succeeds
    });
});
```

### Mock Verification Patterns

```typescript
// Verify specific interactions
expect(mockFunction).toHaveBeenCalledWith(expectedArg1, expectedArg2);

// Verify call order
expect(mockFunction1).toHaveBeenCalledBefore(mockFunction2 as jest.Mock);

// Verify no unexpected calls
expect(mockFunction).not.toHaveBeenCalled();
```

## Key Takeaways

1. **Mock External Dependencies**: Isolate your service logic by mocking databases, APIs, and third-party libraries
2. **Test Business Logic**: Focus on testing your service's behavior, not external dependencies
3. **Use Descriptive Names**: Make tests self-documenting with clear, descriptive test names
4. **Test Error Conditions**: Ensure error handling works as expected
5. **Keep Tests Independent**: Each test should be able to run in isolation
6. **Mock Cleanup**: Always clean up mocks between tests to prevent interference
7. **Test Real Scenarios**: Write tests that reflect actual usage patterns

Remember: Good unit tests catch bugs early, document expected behavior, and give confidence when refactoring code.
