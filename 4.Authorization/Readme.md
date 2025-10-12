# Building Authorization with JWT Middleware

## Overview

**Authorization** is the process of determining what an authenticated user is allowed to do. While **authentication** verifies *who you are*, **authorization** controls *what you can access*.

Think of it like a building security system:

- **Authentication** = Showing your ID card to prove you're an employee
- **Authorization** = Your ID card level determines which floors/rooms you can acess

This project implements **JWT-based authorization** using Express middleware to protect specific routes and ensure only authenticated users can access protected resources.

## Authentication vs Authorization

| Aspect             | Authentication          | Authorization                         |
| ------------------ | ----------------------- | ------------------------------------- |
| **Purpose**  | Verify user identity    | Control access to resources           |
| **Question** | "Who are you?"          | "What can you do?"                    |
| **Process**  | Login with credentials  | Check permissions for actions         |
| **Timing**   | Happens first           | Happens after authentication          |
| **Example**  | Username/Password login | Admin-only routes, user-specific data |

In our application:

- **Authentication** = User logs in and receives a JWT token
- **Authorization** = Middleware checks the JWT token before allowing access to protected routes

## What are Middlewares?

**Middleware** functions are functions that execute during the request-response cycle. They have access to:

- **Request object** (`req`) - incoming HTTP request
- **Response object** (`res`) - outgoing HTTP response
- **Next function** (`next`) - passes control to the next middleware

```typescript
// Basic middleware structure
const middleware = (req: Request, res: Response, next: NextFunction) => {
    // Do something with the request
    console.log('Middleware executed');
  
    // Pass control to next middleware or route handler
    next();
}
```

### Middleware Execution Flow

```
Client Request → Middleware 1 → Middleware 2 → Route Handler → Response
```

Middlewares can:

- **Execute code** before route handlers
- **Modify request/response objects**
- **End request-response cycle** (send response)
- **Call next middleware** in the stack

## JWT Authorization Middleware

Our `bearAuth.ts` middleware implements **Bearer Token Authorization** using JWT tokens.

### Complete Middleware Implementation

```typescript
// src/middleware/bearAuth.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

// middleware to check if the user is authenticated/logged in
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    // Extract token from: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    try {
        // Verify and decode the JWT token
        const decode = jwt.verify(token, process.env.JWT_SECRET as string);
    
        // Attach user info to request object for use in route handlers
        (req as any).user = decode; // Type assertion to avoid TypeScript error
    
        // Pass control to next middleware/route handler
        next();

    } catch (error) {
        // Token is invalid, expired, or malformed
        res.status(401).json({ message: 'Unauthorized' });
    }
}
```

### How the Middleware Works

1. **Extract Authorization Header**

   ```typescript
   const authHeader = req.headers.authorization;
   // Expected format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```
2. **Validate Header Format**

   ```typescript
   if (!authHeader || !authHeader.startsWith('Bearer ')) {
       res.status(401).json({ message: 'Unauthorized' });
       return;
   }
   ```
3. **Extract JWT Token**

   ```typescript
   const token = authHeader.split(' ')[1];
   // Splits "Bearer <token>" and takes the second part
   ```
4. **Verify Token**

   ```typescript
   const decode = jwt.verify(token, process.env.JWT_SECRET as string);
   // Throws error if token is invalid, expired, or tampered with
   ```
5. **Attach User Data**

   ```typescript
   (req as any).user = decode;
   // Makes user info available in route handlers via req.user
   ```
6. **Continue to Next Middleware**

   ```typescript
   next();
   // Allows request to proceed to route handler
   ```

### Security Features

- **Bearer Token Standard**: Follows RFC 6750 Bearer Token specification
- **JWT Verification**: Validates token signature and expiration
- **Error Handling**: Returns 401 Unauthorized for invalid tokens
- **User Context**: Attaches decoded user info to request object

## Using Authorization in Routes

The `todo.routes.ts` file demonstrates how to apply authorization selectively to different endpoints.

### Route Protection Implementation

```typescript
// src/router/todo.routes.ts
import { Express } from "express";
import * as todoController from '../controllers/todo.controllers'
import { isAuthenticated } from "../middleware/bearAuth";

const todoRoutes = (app: Express) => {
    // PROTECTED ROUTES - Require authentication
    app.get('/todos', isAuthenticated, todoController.getTodos);
    app.post('/todos', isAuthenticated, todoController.createTodo);
    app.get('/alltodos', isAuthenticated, todoController.getAllTodosController);
  
    // PUBLIC ROUTES - No authentication required
    app.get('/todos/:id', todoController.getTodoById);
    app.put('/todos/:id', todoController.updateTodo);
    app.delete('/todos/:id', todoController.deleteTodo);
    app.post('/addtodo', todoController.AddTodoController);
}

export default todoRoutes;
```

### Route Categories

### Protected Routes (Require Authentication)

These routes use the `isAuthenticated` middleware:

1. **`GET /todos`** - List user's todos

   ```typescript
   app.get('/todos', isAuthenticated, todoController.getTodos);
   ```
2. **`POST /todos`** - Create new todo

   ```typescript
   app.post('/todos', isAuthenticated, todoController.createTodo);
   ```
3. **`GET /alltodos`** - Get all todos (practice endpoint)

   ```typescript
   app.get('/alltodos', isAuthenticated, todoController.getAllTodosController);
   ```

#### Public Routes (No Authentication)

These routes can be accessed without tokens:

1. **`GET /todos/:id`** - Get specific todo by ID
2. **`PUT /todos/:id`** - Update specific todo
3. **`DELETE /todos/:id`** - Delete specific todo
4. **`POST /addtodo`** - Add todo (practice endpoint)

### Middleware Execution Flow

When a client requests a protected route:

```
1. Client Request:     GET /todos with "Authorization: Bearer <token>"
                           ↓
2. isAuthenticated:    Extracts and verifies JWT token
                           ↓
3. Success Path:       Attaches user data to req.user → calls next()
                           ↓
4. Route Handler:      todoController.getTodos executes
                           ↓
5. Response:           Returns todos data to client

OR

3. Failure Path:       Invalid token → Returns 401 Unauthorized
                           ↓
4. End:                Request ends, route handler never executes
```

## Accessing User Data in Controllers

Once the middleware validates the token, controllers can access user information:

```typescript
// Inside a controller function
export const getTodos = async (req: Request, res: Response) => {
    // Access user data attached by middleware
    const user = (req as any).user;
  
    console.log('Current user:', user);
    // Output: { sub: 8, user_id: 8, first_name: "test", last_name: "test", role: "user", exp: 1748680490, iat: 1748421290 }
  
    // Use user.sub or user.user_id to filter user-specific data
    const userTodos = await todoServices.getUserTodos(user.user_id);
  
    res.status(200).json(userTodos);
}
```

## Testing Authorization

### 1. Testing Protected Routes Without Token

```bash
curl -X GET http://localhost:8081/todos

# Response:
{
    "message": "Unauthorized"
}
```

### 2. Testing Protected Routes With Valid Token

First, login to get a token:

```bash
curl -X POST http://localhost:8081/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

Then use the token for protected routes:

```bash
curl -X GET http://localhost:8081/todos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response:
[
  {
    "id": 1,
    "todo_name": "Complete project",
    "description": "Finish the authentication system",
    "due_date": "2025-01-15",
    "user_id": 8
  }
]
```

### 3. Testing Public Routes (No Token Required)

```bash
curl -X GET http://localhost:8081/todos/1

# Response:
{
  "id": 1,
  "todo_name": "Complete project",
  "description": "Finish the authentication system",
  "due_date": "2025-01-15",
  "user_id": 8
}
```

## Common HTTP Status Codes

| Status Code                | Meaning               | When It Occurs                           |
| -------------------------- | --------------------- | ---------------------------------------- |
| **200 OK**           | Success               | Valid token, successful operation        |
| **401 Unauthorized** | Authentication failed | Missing, invalid, or expired token       |
| **403 Forbidden**    | Authorization failed  | Valid token but insufficient permissions |
| **404 Not Found**    | Resource not found    | Valid token but resource doesn't exist   |

## Environment Variables

Ensure your `.env` file contains:

```env
JWT_SECRET=your-super-secret-jwt-key-here
PORT=8081
```

**Security Notes:**

- Use a strong, random JWT secret (minimum 32 characters)
- Never commit `.env` files to version control
- Rotate secrets regularly in production
- Use different secrets for different environments

## Best Practices

### 1. Middleware Placement

```typescript
//  Good: Middleware before route handler
app.get('/todos', isAuthenticated, todoController.getTodos);

// Bad: Middleware after route handler (won't work)
app.get('/todos', todoController.getTodos, isAuthenticated);
```

### 2. Selective Protection

```typescript
//  Good: Only protect routes that need authentication
app.get('/todos', isAuthenticated, todoController.getTodos);        // Protected
app.get('/todos/:id', todoController.getTodoById);                  // Public

// Bad: Protecting everything unnecessarily
app.get('/todos/:id', isAuthenticated, todoController.getTodoById); // May not need protection
```

### 3. Error Handling

```typescript
//  Good: Consistent error responses
res.status(401).json({ message: 'Unauthorized' });

//  Bad: Inconsistent or revealing error messages
res.status(401).json({ error: 'JWT verification failed: invalid signature' });
```

### 4. Token Validation

```typescript
//  Good: Comprehensive validation
if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
}

//  Bad: Incomplete validation
if (!authHeader) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
}
```

## Advanced Authorization Patterns

### Role-Based Access Control (RBAC)

```typescript
// Middleware for admin-only routes
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
  
    if (user.role !== 'admin') {
        res.status(403).json({ message: 'Admin access required' });
        return;
    }
  
    next();
}

// Usage: Chain middlewares
app.delete('/todos/:id', isAuthenticated, isAdmin, todoController.deleteTodo);
```

### Resource-Based Authorization

```typescript
// Middleware to check if user owns the resource
export const isResourceOwner = async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const todoId = req.params.id;
  
    const todo = await todoService.getTodoById(todoId);
  
    if (todo.user_id !== user.user_id) {
        res.status(403).json({ message: 'Access denied: not resource owner' });
        return;
    }
  
    next();
}

// Usage
app.put('/todos/:id', isAuthenticated, isResourceOwner, todoController.updateTodo);
```

## Troubleshooting

### Common Issues

1. **"Unauthorized" on valid token**

   - Check JWT_SECRET environment variable
   - Verify token format: `Authorization: Bearer <token>`
   - Ensure token hasn't expired
2. **Middleware not executing**

   - Verify middleware is placed before route handler
   - Check for syntax errors in middleware function
   - Ensure `next()` is called on success
3. **TypeScript errors with req.user**

   - Use type assertion: `(req as any).user`
   - Or extend Request interface in types file

## Security Considerations

### Token Security

- **Short expiration times**: Use 15-60 minutes for access tokens
- **Secure storage**: Store tokens securely on client-side
- **HTTPS only**: Always use HTTPS in production
- **Token refresh**: Implement refresh token mechanism

### Middleware Security

- **Input validation**: Validate all inputs before processing
- **Error handling**: Don't leak sensitive information in errors
- **Rate limiting**: Implement rate limiting to prevent abuse
- **Logging**: Log authentication attempts for monitoring

## Architecture Benefits

Using middleware for authorization provides:

1. **Separation of Concerns**: Authorization logic separated from business logic
2. **Reusability**: Same middleware can protect multiple routes
3. **Maintainability**: Easy to modify authorization rules centrally
4. **Testability**: Can test authorization logic independently
5. **Flexibility**: Can chain multiple middlewares for complex scenarios

## Next Steps

To enhance your authorization system:

1. **Role-Based Access Control**: Implement user roles and permissions
2. **Resource-Based Authorization**: Check ownership of resources
3. **Token Refresh**: Implement refresh token mechanism
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Audit Logging**: Log all authentication and authorization events
6. **Session Management**: Add session invalidation capabilities

This authorization system provides a solid foundation for securing your Express application while maintaining clean, maintainable code architecture.
