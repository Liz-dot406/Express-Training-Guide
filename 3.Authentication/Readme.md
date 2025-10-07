# Building Authentication with JWT and bcrypt

## Overview

Authentication is the process of verifying who a user is. In web applications, this typically involves:

1. **Registration** - Users create accounts with credentials (email/password)
2. **Login** - Users prove their identity by providing correct credentials
3. **Authorization** - The system grants access to protected resources based on user identity

This project implements **JWT-based authentication** with **bcrypt password hashing** using the same layered architecture pattern from our CRUD operations.

## Why JWT and bcrypt?

### JSON Web Tokens (JWT)

- **Stateless**: No need to store session data on the server
- **Portable**: Can be used across different domains and services
- **Self-contained**: Contains all necessary user information
- **Secure**: Digitally signed to prevent tampering

### bcrypt

- **Password Hashing**: Never store plain-text passwords in the database
- **Salt Generation**: Automatically adds random data to prevent rainbow table attacks
- **Adaptive**: Can increase security over time by adjusting cost factor
- **Industry Standard**: Widely used and battle-tested

## Installation

Install the required packages:

```bash
# Install JWT library for token generation and verification
pnpm i jsonwebtoken

# Install bcrypt for password hashing
pnpm i bcrypt

# Install type definitions for development
pnpm i -D @types/jsonwebtoken @types/bcrypt
```

### What each package does:

- **`jsonwebtoken`** - Creates and verifies JWT tokens for user authentication
- **`bcrypt`** - Hashes passwords before storing them in the database
- **`@types/*`** - Provides TypeScript type definitions for better development experience

## Database Schema Updates

First, we need to add a `password` field to our Users table:

```sql
-- Users table with password field
CREATE TABLE Users (
    userid INT IDENTITY(1,1) PRIMARY KEY,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    password VARCHAR(MAX) NOT NULL  -- Store hashed passwords
);
```

**Key points:**

- `password` field uses `VARCHAR(MAX)` to store the hashed password
- `email` is `UNIQUE` to prevent duplicate accounts
- Never store plain-text passwords in production

## Authentication Flow

The authentication process follows our layered architecture:

```
Registration: Client → Router → Controller → Service → Repository → Database
Login:        Client → Router → Controller → Service → Repository → Database → JWT Token
```

## 1. Password Hashing (Registration)

When a user registers, we hash their password before saving it to the database.

### Service Layer - Password Hashing

```typescript
// src/services/user.service.ts
import bcrypt from "bcrypt"

export const createUser = async (user: NewUser) => {
    //hash the password before saving
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);  // 10 = salt rounds
        console.log(user.password);  // Shows hashed password
    }
    return await userRepositories.createUser(user);
}
```

**How bcrypt works:**

- `bcrypt.hash(password, saltRounds)` generates a unique hash for each password
- **Salt rounds (10)**: Higher numbers = more secure but slower processing
- The resulting hash looks like: `$2b$10$N9qo8uLOickgx2ZMRZoMye.j...`

### Repository Layer - User Creation

```typescript
// src/repositories/user.repository.ts
export const createUser = async (user: NewUser) => {
    const pool = await getPool();
    await pool
        .request()
        .input('first_name', user.first_name)
        .input('last_name', user.last_name)
        .input('email', user.email)
        .input('phone_number', user.phone_number)
        .input('password', user.password)  // This is now hashed
        .query('INSERT INTO Users (first_name, last_name,email, phone_number, password) VALUES (@first_name, @last_name,@email, @phone_number, @password)');
    return { message: 'User created successfully' };
}
```

## 2. User Login Process

Login involves three steps: **Find User → Verify Password → Generate Token**

### Step 1: Find User by Email (Repository)

```typescript
// src/repositories/user.repository.ts
export const getUserByEmail = async (email: string): Promise<User | null> => {
    const pool = await getPool();
    const result = await pool
        .request()
        .input('email', email)
        .query('SELECT * FROM Users WHERE email = @email');
    return result.recordset[0] || null;
}
```

### Step 2: Login Logic (Service)

```typescript
// src/services/user.service.ts
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt"
import dotenv from 'dotenv';

export const loginUser = async (email: string, password: string) => {
    // 1. Find user by email
    const user = await userRepositories.getUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }

    // 2. Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // 3. Create JWT payload
    const payload = {
        sub: user.userid,        // Subject (user ID)
        first_name: user.first_name,
        last_name: user.last_name,
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
    }

    // 4. Generate JWT token
    const secret = process.env.JWT_SECRET as string;
    if (!secret) throw new Error('JWT secret not defined');
    const token = jwt.sign(payload, secret);

    // 5. Return token + user details (without password)
    return {
        message: 'Login successful',
        token,
        user: {
            userid: user.userid,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number
        }
    }
}
```

**Security notes:**

- `bcrypt.compare()` safely compares plain text with hashed password
- JWT payload includes user info and expiration time
- Password is never returned in the response
- Requires `JWT_SECRET` environment variable

### Step 3: Login Controller

```typescript
// src/controllers/user.controllers.ts
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const result = await userServices.loginUser(email, password);
        res.status(200).json(result);
    } catch (error: any) {
        if (error.message === 'User not found') {
            res.status(404).json({ error: error.message });
        } else if (error.message === 'Invalid credentials') {
            res.status(401).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
}
```

**HTTP Status Codes:**

- `200` - Login successful
- `401` - Invalid credentials (wrong password)
- `404` - User not found (wrong email)
- `500` - Server error

### Step 4: Login Route

```typescript
// src/router/user.routes.ts
const userRoutes = (app: Express) => {
    app.get("/users", userController.getAllUsers);
    app.get("/users/:id", userController.getUserById);
    app.post("/users", userController.createUser);        // Registration
    app.put("/users/:id", userController.updateUser);
    app.delete("/users/:id", userController.deleteUser);
    app.post("/login", userController.loginUser);         // Login endpoint
}
```

## Environment Variables

Create a `.env` file in your project root:

```env
JWT_SECRET=your-super-secret-jwt-key-here
PORT=8081
```

**Important:**

- Use a strong, random JWT secret in production
- Never commit `.env` files to version control
- Keep secrets secure and rotate them regularly

## Testing Authentication

### Registration Example

```bash
curl -X POST http://localhost:8081/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe", 
    "email": "john@example.com",
    "phone_number": "1234567890",
    "password": "mySecurePassword123"
  }'
```

### Login Example

```bash
curl -X POST http://localhost:8081/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "mySecurePassword123"
  }'
```

**Expected Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userid": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone_number": "1234567890"
  }
}
```

## Security Best Practices

### Password Security

- **Never store plain-text passwords**
- Use bcrypt with at least 10 salt rounds
- Implement password strength requirements
- Consider adding password reset functionality

### JWT Security

- Use strong, random secrets
- Set appropriate expiration times (1-24 hours)
- Consider implementing refresh tokens
- Validate tokens on protected routes

### Database Security

- Use parameterized queries (we already do this)
- Make email field unique to prevent duplicates
- Consider adding indexes on frequently queried fields

## Architecture Benefits

Using the layered architecture for authentication provides:

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Can test login logic without HTTP requests
3. **Reusability**: Authentication logic can be used in different controllers
4. **Maintainability**: Easy to modify or replace authentication methods
5. **Security**: Clear boundaries between layers reduce attack surface

## Next Steps

To complete your authentication system, consider adding:

1. **Middleware**: Protect routes that require authentication
2. **Token Refresh**: Implement refresh token mechanism
3. **Password Reset**: Allow users to reset forgotten passwords
4. **Rate Limiting**: Prevent brute force attacks
5. **Email Verification**: Verify user emails during registration

This authentication system provides a solid foundation for secure user management in your Express application.
