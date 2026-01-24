# Professional Logging System

## Overview

Your Connectly project now has a comprehensive professional logging system that tracks every step of your application. This system provides detailed logs for debugging, monitoring, and understanding your application's behavior in development and production.

## Logging Utility

### Location
`src/utils/logger.ts`

### Features

#### Log Levels
- **INFO** ℹ️ - General informational messages
- **SUCCESS** ✅ - Successful operations
- **WARN** ⚠️ - Warning messages
- **ERROR** ❌ - Error messages
- **DEBUG** 🔍 - Debug information (only in development)

#### Specialized Logging Methods

1. **Basic Logging**
   ```typescript
   Logger.info("ActionName", "Message", { data });
   Logger.success("ActionName", "Operation completed");
   Logger.warn("ActionName", "Warning message");
   Logger.error("ActionName", "Error occurred", { error });
   Logger.debug("ActionName", "Debug info");
   ```

2. **Operation Tracking**
   ```typescript
   Logger.start("ActionName", "Starting operation");
   Logger.end("ActionName", "Operation completed");
   ```

3. **HTTP Requests**
   ```typescript
   Logger.request("ActionName", "GET", "/api/posts");
   Logger.response("ActionName", 200, "Success");
   ```

4. **Database Operations**
   ```typescript
   Logger.db("ServiceName", "SELECT", "posts");
   Logger.db("ServiceName", "INSERT", "users");
   ```

5. **Authentication**
   ```typescript
   Logger.auth("ActionName", "User authenticated", { userId });
   ```

6. **Middleware**
   ```typescript
   Logger.middleware("Middleware", "Request processed");
   ```

7. **Performance Monitoring**
   ```typescript
   Logger.performance("ActionName", "Operation", durationMs);
   ```

8. **Validation**
   ```typescript
   Logger.validation("ActionName", "fieldName", "Error message");
   ```

9. **Timer (Automatic Performance Tracking)**
   ```typescript
   const timer = Logger.timer("ActionName", "Operation description");
   // ... your code ...
   timer.end("Optional completion message");
   ```

## Implementation Coverage

### ✅ Server-Side Logging

#### 1. Middleware (`src/middleware.ts`)
- Request/response tracking
- Route classification
- Authentication checks
- Cookie operations
- Performance metrics

#### 2. API Routes
- **Login API** (`src/app/api/auth/login/route.ts`)
  - Login attempts
  - Authentication success/failure
  - Cookie setting
  - Error handling

- **Auth Callback** (`src/app/api/auth/callback/route.ts`)
  - Email verification
  - Token validation
  - Session creation
  - Redirects

- **Posts API** (`src/app/api/posts/route.ts`)
  - Post creation
  - Post fetching
  - Authentication checks
  - Database operations

#### 3. Server Actions
- **Auth Actions** (`src/server/actions/auth.actions.ts`)
  - Signup flow
  - Signin flow
  - Logout flow
  - Error tracking

- **Post Actions** (`src/server/actions/post.actions.ts`)
  - Create post
  - Delete post
  - Toggle like
  - Ownership verification

#### 4. Services
- **Auth Service** (`src/server/services/auth.service.ts`)
  - User fetching by ID
  - User fetching by username
  - Profile updates

- **Post Service** (`src/server/services/post.service.ts`)
  - Feed retrieval
  - Single post fetch
  - User posts fetch

### ✅ Client-Side Logging

#### 1. Components
- **Signin Form** (`src/components/layout/login/_lib/signin-form.tsx`)
  - Login attempts
  - Success/failure tracking
  - Error handling

- **Signup Form** (`src/components/layout/signup/_lib/signup-form.tsx`)
  - Registration attempts
  - Validation
  - Success/failure tracking

#### 2. Error Boundary
- **ErrorBoundary** (`src/components/shared/ErrorBoundary.tsx`)
  - React error catching
  - Component stack traces
  - User-friendly error display
  - Development error details

## Log Output Format

### Server-Side Format
```
[2026-01-25T10:30:45.123Z] ℹ️ [INFO] [ActionName] Message
```

### Client-Side Format
```
ℹ️ [ActionName] Message { data }
```

## Usage Examples

### Server-Side Example
```typescript
import { Logger } from "@/utils/logger";

export async function myServerAction() {
    const timer = Logger.timer("MyAction", "Processing request");
    
    try {
        Logger.start("MyAction", "Starting operation");
        Logger.debug("MyAction", "Input received", { data });
        
        // Your code here
        Logger.db("MyAction", "INSERT", "table_name");
        
        Logger.success("MyAction", "Operation completed");
        timer.end("Request processed successfully");
        
        return { success: true };
    } catch (error) {
        Logger.error("MyAction", "Operation failed", {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
    }
}
```

### Client-Side Example
```typescript
"use client";
import { clientLogger } from "@/utils/logger";

function MyComponent() {
    const handleClick = async () => {
        clientLogger.info("MyComponent", "Button clicked");
        
        try {
            // Your code
            clientLogger.success("MyComponent", "Operation successful");
        } catch (error) {
            clientLogger.error("MyComponent", "Error occurred", {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    };
    
    return <button onClick={handleClick}>Click Me</button>;
}
```

## Monitoring Your Application

### Development
All logs are visible in:
- **Terminal/Console** - Server-side logs
- **Browser Console** - Client-side logs
- Debug logs are enabled in development

### Production
- Error logs are always captured
- Debug logs are disabled
- Performance metrics are tracked
- All logs follow the same format for easy parsing

## Log Analysis

### What Gets Logged

1. **Every HTTP Request**
   - Method (GET, POST, etc.)
   - Path
   - Duration
   - Status code

2. **Authentication Events**
   - Login attempts
   - Logout events
   - Token operations
   - Session management

3. **Database Operations**
   - Query type (SELECT, INSERT, UPDATE, DELETE)
   - Table name
   - Success/failure
   - Error details

4. **User Actions**
   - Post creation
   - Post deletion
   - Like/unlike actions
   - Profile updates

5. **Errors**
   - Error messages
   - Stack traces (in development)
   - Context data
   - User information (when available)

6. **Performance**
   - Operation duration
   - Slow operations
   - Request timing

## Best Practices

1. **Always log at operation boundaries**
   - Start of functions
   - End of functions
   - Before/after external calls

2. **Include context**
   - User IDs
   - Request IDs
   - Relevant data (without sensitive info)

3. **Use appropriate log levels**
   - Don't log passwords or tokens
   - Use DEBUG for verbose info
   - Use ERROR for actual errors

4. **Performance tracking**
   - Use timer for long operations
   - Monitor database queries
   - Track API response times

5. **Error handling**
   - Always log errors with context
   - Include stack traces in development
   - Log user-facing error messages

## Troubleshooting with Logs

### Finding Issues
1. Search for `❌` (errors) in logs
2. Check timestamps to correlate events
3. Look for patterns in errors
4. Track user journeys through logs

### Performance Issues
1. Look for long operation times
2. Check database query performance
3. Monitor API response times
4. Identify slow middleware operations

### Authentication Issues
1. Search for `🔐` (auth logs)
2. Track login/logout flows
3. Check cookie operations
4. Verify token handling

## Future Enhancements

Consider adding:
- Log aggregation service (e.g., DataDog, Sentry)
- Log rotation
- Log levels via environment variables
- Request ID tracking
- User session tracking
- Analytics integration

## Summary

Your application now has enterprise-grade logging that:
- ✅ Tracks every operation
- ✅ Provides detailed error information
- ✅ Monitors performance
- ✅ Helps with debugging
- ✅ Works in development and production
- ✅ Follows consistent patterns
- ✅ Includes timing information
- ✅ Catches and logs errors automatically

The logging system will help you understand exactly what's happening in your application at every step, making debugging and monitoring much easier!
