# Role-Based Authentication in Express.js

## Overview

**Role-Based Access Control (RBAC)** is a security approach that restricts system access based on the roles assigned to individual users. Instead of giving permissions directly to users, you assign users to roles, and roles get specific permissions.

This project implements a clean, JWT-based authentication system with role management using a **layered architecture**. Users can have different roles (`admin`, `user`), and routes can be protected to allow access only to specific roles or combinations of roles.

### Why Role-Based Authentication?

Think of roles like job positions in a company:

| Role        | Permissions                           | Real-World Example       |
| ----------- | ------------------------------------- | ------------------------ |
| **Admin**   | Full access - create, read, update, delete | Manager can access all files |
| **User**    | Limited access - typically read/create only | Employee can view own tasks |
| **Both**    | Flexible access - allows admin OR user | Public documents anyone can read |

This approach makes your API:
- **Secure** (users only access what they're allowed to)
- **Scalable** (easy to add new roles)
- **Maintainable** (role changes don't require code changes)
- **Clear** (you know exactly who can do what)

## Implementation Flow

```
1. User logs in → JWT token generated (includes role)
2. User makes request → Token sent in Authorization header
3. Middleware extracts token → Verifies signature and role
4. Route handler executes → Only if role matches requirements
```

## 1. Database Setup - Adding Roles

First, we add a `role` column to our Users table to store each user's role:

```sql
-- users table with role column
CREATE TABLE Users (
    userid INT IDENTITY(1,1) PRIMARY KEY,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    password VARCHAR(MAX) NOT NULL,
    -- roles - admin, user
    role VARCHAR(20) DEFAULT 'user'
);

-- Sample data with different roles
INSERT INTO Users (first_name, last_name, email, phone_number, password, role) VALUES
('Alice', 'Mwangi', 'alice@gmail.com', '0711000001', 'password123', 'admin'),
('Brian', 'Kemboi', 'brian@gmail.com', '0711000002', 'password123', 'user'),
('Carol', 'Koech', 'carol@gmail.com', '0711000003', 'password123', 'user');
```

**Key Points:**
- `role VARCHAR(20) DEFAULT 'user'` - Every new user gets 'user' role by default
- We store roles as simple strings ('admin', 'user')
- Alice is an admin, Brian and Carol are regular users

## 2. JWT Payload Generation - Including User Role

When a user logs in successfully, we generate a JWT token that includes their role information:

```ts
// In user.service.ts - loginUser function
export const loginUser = async (email: string, password: string) => {
    // Find user by email
    const user = await userRepositories.getUserByEmail(email);
    if (!user) {
        throw new Error('User not found');
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // Create JWT payload - IMPORTANT: Include user.role
    const payload = {
        sub: user.userid,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,  // 👈 This is crucial for role-based auth
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET as string;
    if (!secret) throw new Error('JWT secret not defined');
    const token = jwt.sign(payload, secret);

    return {
        message: 'Login successful',
        token,
        user: {
            userid: user.userid,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role  // Also return role in response
        }
    }
}
```

**What happens here:**
1. User provides email/password
2. We verify credentials against the database
3. We create a JWT payload that **includes the user's role**
4. We sign the token and return it to the client
5. Client stores this token and sends it with future requests

## 3. Role-Based Middleware - The Security Guard

The middleware acts like a security guard that checks if a user has the right "badge" (role) to enter certain areas:

```ts
// In middleware/bearAuth.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

// Main role-checking function
export const checkRoles = (requiredRole: "admin" | "user" | "both") => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        // Step 1: Check if Authorization header exists and has Bearer token
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Step 2: Extract the token
        const token = authHeader.split(' ')[1];

        try {
            // Step 3: Verify and decode the JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            
            // Step 4: Attach user info to request for later use
            (req as any).user = decoded;

            // Step 5: Role validation - ensure token has role property
            if (typeof decoded === 'object' &&
                decoded !== null && 
                "role" in decoded
            ) {
                // Step 6: Check role permissions
                if (requiredRole === "both") {
                    // Allow both admin and user roles
                    if (decoded.role === "admin" || decoded.role === "user") {
                        next(); // ✅ Access granted
                        return;
                    }
                } else if (decoded.role === requiredRole) {
                    // Role matches exactly what's required
                    next(); // ✅ Access granted
                    return;
                }
                
                // ❌ Wrong role
                res.status(401).json({ message: "Unauthorized" });
                return;
            } else {
                // ❌ Token doesn't have proper role information
                res.status(401).json({ message: "Invalid Token Payload" });
                return;
            }
        } catch (error) {
            // ❌ Token is invalid or expired
            res.status(401).json({ message: 'Invalid Token' });
            return;
        }
    }
}

// Pre-configured middleware for common use cases
export const adminOnly = checkRoles("admin");   // Only admins allowed
export const userOnly = checkRoles("user");     // Only regular users allowed  
export const adminUser = checkRoles("both");    // Both admins and users allowed
```

**How it works:**
1. **Extract Token**: Gets JWT from `Authorization: Bearer <token>` header
2. **Verify Token**: Confirms token is valid and not expired
3. **Check Role**: Compares user's role with what the route requires
4. **Grant/Deny Access**: Calls `next()` if authorized, returns error if not

## 4. Protecting Routes - Practical Usage

Finally, we apply our role-based middleware to protect specific routes:

```ts
// In router/todo.routes.ts
import { Express } from "express";
import * as todoController from '../controllers/todo.controllers'
import { adminOnly, userOnly, adminUser } from "../middleware/bearAuth";

const todoRoutes = (app: Express) => {
    // Mixed access - both admins and users can view todos
    app.get('/todos', adminUser, todoController.getTodos);
    
    // Public access - anyone can view individual todo (no middleware)
    app.get('/todos/:id', todoController.getTodoById);
    
    // Admin only - only admins can create todos
    app.post('/todos', adminOnly, todoController.createTodo);
    
    // Mixed access - both roles can update (business logic in controller can add more restrictions)
    app.put('/todos/:id', adminUser, todoController.updateTodo);
    
    // Admin only - only admins can delete todos
    app.delete('/todos/:id', adminOnly, todoController.deleteTodo);

    // Practice routes with no restrictions
    app.get('/alltodos', todoController.getAllTodosController);
    app.post('/addtodo', todoController.AddTodoController);
}

export default todoRoutes;
```

## Authentication Flow Example

Let's walk through a complete example:

### 1. User Login (Getting the Token)
```bash
POST /login
{
  "email": "alice@gmail.com",
  "password": "password123"
}

# Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userid": 1,
    "first_name": "Alice",
    "role": "admin"
  }
}
```

### 2. Making Protected Requests
```bash
# ✅ Admin accessing admin-only route (SUCCESS)
POST /todos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
{
  "todo_name": "Review reports",
  "description": "Monthly review"
}

# ❌ Regular user trying admin-only route (FAILS)
POST /todos  
Authorization: Bearer <user-token>
# Response: 401 Unauthorized

# ✅ Both admin and user accessing mixed route (SUCCESS)
GET /todos
Authorization: Bearer <any-valid-token>
```

## Security Best Practices

1. **Always validate tokens**: Never trust a request without proper token verification
2. **Use HTTPS**: JWT tokens should never be sent over unsecured connections
3. **Short expiration times**: Tokens should expire frequently (1 hour in our example)
4. **Secure JWT secrets**: Use long, random secrets and store them as environment variables
5. **Principle of least privilege**: Give users only the minimum permissions they need

## Common Patterns

### Route Protection Levels
```ts
// No protection - public access
app.get('/public', controller.publicEndpoint);

// User authentication required (any valid user)
app.get('/protected', adminUser, controller.protectedEndpoint);

// Role-specific access
app.post('/admin-only', adminOnly, controller.adminEndpoint);
app.get('/user-only', userOnly, controller.userEndpoint);
```

### Error Responses
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Valid token but insufficient permissions (wrong role)
- `200 OK` - Valid token and correct role

## Extending the System

To add new roles:

1. **Database**: Add new role values to your Users table
2. **Middleware**: Update the role type definition: `"admin" | "user" | "moderator"`
3. **Routes**: Create new middleware: `export const moderatorOnly = checkRoles("moderator")`

This role-based authentication system provides a solid foundation for securing your Express.js applications while remaining flexible and easy to extend.