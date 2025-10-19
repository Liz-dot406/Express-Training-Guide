# HTTP Status Codes Guide

## Overview

**HTTP Status Codes** are three-digit numbers returned by web servers to indicate the result of a client's request. They are an essential part of HTTP communication, helping developers understand what happened with their API requests and how to handle different scenarios appropriately.

REST APIs use the Status-Line part of an HTTP response message to inform clients of their request's overarching result.

### Why Status Codes Matter

Status codes provide immediate feedback about request results and are divided into five main categories:

| Category                | Range | Purpose                        | Example Use Case                     |
| ----------------------- | ----- | ------------------------------ | ------------------------------------ |
| **Informational** | 1xx   | Protocol-level information     | Continue processing request          |
| **Success**       | 2xx   | Request completed successfully | Data retrieved, resource created     |
| **Redirection**   | 3xx   | Additional action required     | Resource moved, cache validation     |
| **Client Error**  | 4xx   | Problem with client request    | Invalid data, unauthorized access    |
| **Server Error**  | 5xx   | Server-side problems           | Internal errors, service unavailable |

Understanding status codes helps developers:

- **Debug Issues** (identify whether problems are client or server-side)
- **Handle Responses** (implement appropriate error handling)
- **Build Better APIs** (return meaningful status codes)
- **Improve User Experience** (show relevant error messages)

## Most Common HTTP Status Codes for REST APIs

### 2xx Success Codes

#### 200 OK

Indicates that the REST API successfully carried out whatever action the client requested. This is the most common success code.

**When to use:**

- GET requests that return data
- Successful operations that return response data

**Response characteristics:**

- **MUST** include a response body
- Content varies by HTTP method:
  - **GET**: Entity corresponding to the requested resource
  - **HEAD**: Entity-header fields without message body
  - **POST**: Entity describing the result of the action
  - **TRACE**: Request message as received by server

**Example:**

```json
HTTP/1.1 200 OK
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### 201 Created

Used when a new resource is successfully created, typically in response to POST requests.

**When to use:**

- Resource created in a collection
- New resource created by controller action

**Response characteristics:**

- **MUST** create resource before returning this code
- **SHOULD** include Location header with URI of new resource
- May include representation of created resource in body

**Example:**

```json
HTTP/1.1 201 Created
Location: /api/users/123
{
  "id": 123,
  "message": "User created successfully"
}
```

#### 202 Accepted

Indicates request has been accepted for processing but not completed yet.

**When to use:**

- Long-running operations (batch processing, async tasks)
- Operations that may not complete immediately

**Response characteristics:**

- **SHOULD** include status information
- **SHOULD** provide status monitor location or completion estimate

**Example:**

```json
HTTP/1.1 202 Accepted
{
  "jobId": "abc123",
  "status": "processing",
  "statusUrl": "/api/jobs/abc123"
}
```

#### 204 No Content

Indicates successful request but no content to return in response body.

**When to use:**

- DELETE operations
- PUT/PATCH updates without returning updated resource
- Operations that don't need response data

**Response characteristics:**

- **MUST NOT** include message body
- Commonly used for successful DELETE operations

**Example:**

```text
HTTP/1.1 204 No Content
```

### 3xx Redirection Codes

#### 301 Moved Permanently

The resource has been permanently moved to a new URI. All future requests should use the new URI.

**When to use:**

- API versioning (though API versioning is preferred)
- Permanent resource location changes

**Response characteristics:**

- **MUST** include Location header with new URI
- Future requests should use new URI
- Response is cacheable

**Example:**

```text
HTTP/1.1 301 Moved Permanently
Location: /api/v2/users
```

#### 302 Found (Temporary Redirect)

The resource is temporarily located at a different URI.

**When to use:**

- Temporary resource moves
- Load balancing scenarios

**Response characteristics:**

- **SHOULD** include Location header
- Future requests should still use original URI

#### 304 Not Modified

The resource has not been modified since the version specified in request headers.

**When to use:**

- Caching scenarios with If-Modified-Since or If-None-Match headers
- Bandwidth optimization

**Response characteristics:**

- **MUST NOT** include message body
- Client should use cached version

#### 307 Temporary Redirect

Indicates the client should resubmit the request to a different URI but keep using the original URI for future requests.

**When to use:**

- Temporary server maintenance redirects
- Load balancing to different hosts

**Response characteristics:**

- **MUST** preserve the original HTTP method
- **SHOULD** include Location header

### 4xx Client Error Codes

#### 400 Bad Request

Generic client-side error when no other 4xx code is appropriate.

**When to use:**

- Malformed request syntax
- Invalid request message parameters
- Invalid JSON structure

**Response characteristics:**

- Client **SHOULD NOT** repeat request without modifications
- Include helpful error message in response body

**Example:**

```json
HTTP/1.1 400 Bad Request
{
  "error": "Invalid JSON syntax",
  "message": "Expected property name or '}' at line 1 column 15"
}
```

#### 401 Unauthorized

The client needs to provide authentication credentials.

**When to use:**

- Missing authentication credentials
- Invalid authentication credentials
- Expired tokens

**Response characteristics:**

- **MUST** include WWW-Authenticate header
- Client **MAY** retry with proper credentials

**Example:**

```json
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer
{
  "error": "Authentication required",
  "message": "Please provide a valid access token"
}
```

#### 403 Forbidden

The client's request is valid but the server refuses to authorize it.

**When to use:**

- Valid credentials but insufficient permissions
- Access denied to resource
- Known client identity but unauthorized action

**Response characteristics:**

- Authentication will **NOT** help
- Request **SHOULD NOT** be repeated
- Different from 401 (client identity is known)

**Example:**

```json
HTTP/1.1 403 Forbidden
{
  "error": "Insufficient permissions",
  "message": "Admin role required to access this resource"
}
```

#### 404 Not Found

The server cannot find the requested resource.

**When to use:**

- Resource doesn't exist
- Invalid endpoint paths
- Deleted resources

**Response characteristics:**

- May be available in the future
- Subsequent requests are permissible

**Example:**

```json
HTTP/1.1 404 Not Found
{
  "error": "Resource not found",
  "message": "User with ID 999 does not exist"
}
```

#### 405 Method Not Allowed

The HTTP method is not supported for this resource.

**When to use:**

- Using POST on read-only resource
- Using DELETE on protected resource
- Method not implemented for endpoint

**Response characteristics:**

- **MUST** include Allow header listing supported methods

**Example:**

```text
HTTP/1.1 405 Method Not Allowed
Allow: GET, POST
{
  "error": "Method not allowed",
  "message": "DELETE method is not supported for this resource"
}
```

#### 406 Not Acceptable

The server cannot generate content matching the client's Accept headers.

**When to use:**

- Client requests XML but server only supports JSON
- Unsupported content negotiation

**Example:**

```json
HTTP/1.1 406 Not Acceptable
{
  "error": "Not acceptable",
  "message": "Server only supports application/json content type"
}
```

#### 409 Conflict

The request conflicts with the current state of the resource.

**When to use:**

- Duplicate resource creation
- Concurrent modification conflicts
- Business rule violations

**Example:**

```json
HTTP/1.1 409 Conflict
{
  "error": "Conflict",
  "message": "User with email 'john@example.com' already exists"
}
```

#### 412 Precondition Failed

One or more conditions in the request headers were not met.

**When to use:**

- If-Match header conditions fail
- If-Unmodified-Since conditions fail
- Conditional requests that fail

#### 415 Unsupported Media Type

The server cannot process the media type in the request.

**When to use:**

- Client sends XML but server expects JSON
- Unsupported file upload formats

**Example:**

```json
HTTP/1.1 415 Unsupported Media Type
{
  "error": "Unsupported media type",
  "message": "Content-Type must be application/json"
}
```

#### 422 Unprocessable Entity

The request is well-formed but contains semantic errors.

**When to use:**

- Valid JSON but business logic violations
- Validation failures
- Input data doesn't meet requirements

**Example:**

```json
HTTP/1.1 422 Unprocessable Entity
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "age",
      "message": "Must be between 18 and 100"
    }
  ]
}
```

#### 429 Too Many Requests

The client has sent too many requests in a given time period (rate limiting).

**When to use:**

- API rate limiting
- DDoS protection
- Resource usage control

**Response characteristics:**

- **MAY** include Retry-After header

**Example:**

```json
HTTP/1.1 429 Too Many Requests
Retry-After: 60
{
  "error": "Rate limit exceeded",
  "message": "Maximum 100 requests per minute. Try again in 60 seconds."
}
```

### 5xx Server Error Codes

#### 500 Internal Server Error

Generic server error when no other 5xx code is appropriate.

**When to use:**

- Unexpected server conditions
- Unhandled exceptions
- System failures

**Response characteristics:**

- Never the client's fault
- Client **MAY** retry the same request
- Should be logged for debugging

**Example:**

```json
HTTP/1.1 500 Internal Server Error
{
  "error": "Internal server error",
  "message": "An unexpected error occurred. Please try again later."
}
```

#### 501 Not Implemented

The server does not support the functionality required to fulfill the request.

**When to use:**

- HTTP method not implemented
- Future features not yet available

#### 502 Bad Gateway

The server received an invalid response from an upstream server.

**When to use:**

- Proxy/gateway errors
- Microservice communication failures
- Database connection issues

#### 503 Service Unavailable

The server is temporarily unable to handle requests.

**When to use:**

- Server maintenance
- Temporary overload
- System updates

**Response characteristics:**

- **MAY** include Retry-After header
- Indicates temporary condition

**Example:**

```json
HTTP/1.1 503 Service Unavailable
Retry-After: 300
{
  "error": "Service unavailable",
  "message": "Server is under maintenance. Please try again in 5 minutes."
}
```

#### 504 Gateway Timeout

The server did not receive a timely response from an upstream server.

**When to use:**

- Upstream server timeouts
- Slow database responses
- Microservice communication timeouts

## Complete HTTP Status Code Reference

### 1xx Informational

| Code | Name                | Description                                         |
| ---- | ------------------- | --------------------------------------------------- |
| 100  | Continue            | Client should continue with request                 |
| 101  | Switching Protocols | Server is switching protocols per client request    |
| 102  | Processing          | Server has received and is processing the request   |
| 103  | Early Hints         | Used with Link header to start preloading resources |

### 2xx Success

| Code | Name                          | Description                                |
| ---- | ----------------------------- | ------------------------------------------ |
| 200  | OK                            | Request succeeded                          |
| 201  | Created                       | New resource was created                   |
| 202  | Accepted                      | Request accepted for processing            |
| 203  | Non-Authoritative Information | Metadata not from origin server            |
| 204  | No Content                    | Request succeeded but no content to return |
| 205  | Reset Content                 | Client should reset the document           |
| 206  | Partial Content               | Partial resource returned (Range header)   |
| 207  | Multi-Status                  | Multiple operations with mixed results     |
| 208  | Already Reported              | Resource already enumerated                |
| 226  | IM Used                       | Instance manipulations applied             |

### 3xx Redirection

| Code | Name               | Description                           |
| ---- | ------------------ | ------------------------------------- |
| 300  | Multiple Choices   | Multiple response options available   |
| 301  | Moved Permanently  | Resource permanently moved            |
| 302  | Found              | Resource temporarily moved            |
| 303  | See Other          | Response found at different URI       |
| 304  | Not Modified       | Resource not modified, use cache      |
| 305  | Use Proxy          | Must use specified proxy (deprecated) |
| 307  | Temporary Redirect | Temporarily redirect with same method |
| 308  | Permanent Redirect | Permanently redirect with same method |

### 4xx Client Error

| Code | Name                            | Description                          |
| ---- | ------------------------------- | ------------------------------------ |
| 400  | Bad Request                     | Malformed request                    |
| 401  | Unauthorized                    | Authentication required              |
| 402  | Payment Required                | Payment required (experimental)      |
| 403  | Forbidden                       | Access denied                        |
| 404  | Not Found                       | Resource not found                   |
| 405  | Method Not Allowed              | HTTP method not supported            |
| 406  | Not Acceptable                  | Cannot produce acceptable response   |
| 407  | Proxy Authentication Required   | Proxy authentication needed          |
| 408  | Request Timeout                 | Request took too long                |
| 409  | Conflict                        | Conflict with current resource state |
| 410  | Gone                            | Resource permanently unavailable     |
| 411  | Length Required                 | Content-Length header required       |
| 412  | Precondition Failed             | Preconditions not met                |
| 413  | Payload Too Large               | Request entity too large             |
| 414  | URI Too Long                    | Request URI too long                 |
| 415  | Unsupported Media Type          | Media type not supported             |
| 416  | Range Not Satisfiable           | Range header cannot be satisfied     |
| 417  | Expectation Failed              | Expect header cannot be satisfied    |
| 418  | I'm a teapot                    | April Fool's joke (RFC 2324)         |
| 422  | Unprocessable Entity            | Semantic errors in request           |
| 423  | Locked                          | Resource is locked                   |
| 424  | Failed Dependency               | Previous request failed              |
| 425  | Too Early                       | Request might be replayed            |
| 426  | Upgrade Required                | Client must upgrade protocol         |
| 428  | Precondition Required           | Request must be conditional          |
| 429  | Too Many Requests               | Rate limiting applied                |
| 431  | Request Header Fields Too Large | Headers too large                    |
| 451  | Unavailable For Legal Reasons   | Legal restrictions                   |

### 5xx Server Error

| Code | Name                            | Description                    |
| ---- | ------------------------------- | ------------------------------ |
| 500  | Internal Server Error           | Generic server error           |
| 501  | Not Implemented                 | Method not implemented         |
| 502  | Bad Gateway                     | Invalid response from upstream |
| 503  | Service Unavailable             | Server temporarily unavailable |
| 504  | Gateway Timeout                 | Upstream server timeout        |
| 505  | HTTP Version Not Supported      | HTTP version not supported     |
| 506  | Variant Also Negotiates         | Configuration error            |
| 507  | Insufficient Storage            | Server storage insufficient    |
| 508  | Loop Detected                   | Infinite loop detected         |
| 510  | Not Extended                    | Extensions required            |
| 511  | Network Authentication Required | Network authentication needed  |

## Best Practices for Using Status Codes

### 1. Be Specific and Consistent

```javascript
// Good: Specific error codes
if (user.email === existingUser.email) {
  return res.status(409).json({ error: "Email already exists" });
}

// Avoid: Generic errors
if (user.email === existingUser.email) {
  return res.status(400).json({ error: "Bad request" });
}
```

### 2. Include Helpful Error Messages

```javascript
// Good: Descriptive error
return res.status(422).json({
  error: "Validation failed",
  details: [
    { field: "email", message: "Must be a valid email address" },
    { field: "password", message: "Must be at least 8 characters" }
  ]
});

// Avoid: Vague errors
return res.status(422).json({ error: "Invalid input" });
```

### 3. Use Appropriate Headers

```javascript
// For authentication errors
res.set('WWW-Authenticate', 'Bearer');
res.status(401).json({ error: "Token required" });

// For method not allowed
res.set('Allow', 'GET, POST');
res.status(405).json({ error: "Method not allowed" });

// For rate limiting
res.set('Retry-After', '60');
res.status(429).json({ error: "Rate limit exceeded" });
```

### 4. Handle Edge Cases

```javascript
// Check for different error scenarios
if (!user) {
  return res.status(404).json({ error: "User not found" });
}

if (!req.user.permissions.includes('admin')) {
  return res.status(403).json({ error: "Admin access required" });
}

if (req.user.id !== user.id && !req.user.isAdmin) {
  return res.status(403).json({ error: "Cannot modify other users" });
}
```

### 5. Document Your API Status Codes

Always document which status codes your API endpoints can return:

```text
POST /api/users
Responses:
  201 - User created successfully
  400 - Invalid request data
  409 - Email already exists
  422 - Validation errors
  500 - Server error

GET /api/users/:id
Responses:
  200 - User data retrieved
  401 - Authentication required
  403 - Insufficient permissions
  404 - User not found
  500 - Server error
```
