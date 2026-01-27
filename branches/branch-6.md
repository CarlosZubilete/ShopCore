# Branch 6 - Comprehensive Change Documentation

**Branch:** `branch-6`  
**Date:** January 26, 2026  
**Status:** Development

---

## Executive Summary

This branch introduces significant enhancements to the authentication and authorization system, implements role-based access control (RBAC), and refactors error handling for improved type safety and consistency. The codebase now supports permission-based resource access, improved error categorization, and enhanced security measures through environment-aware configuration.

---

## Table of Contents

1. [Configuration Changes](#configuration-changes)
2. [Error Handling Improvements](#error-handling-improvements)
3. [Authentication & Authorization](#authentication--authorization)
4. [User Module Enhancements](#user-module-enhancements)
5. [New Modules & Files](#new-modules--files)
6. [Route Structure Updates](#route-structure-updates)
7. [Testing Resources](#testing-resources)
8. [Project Metadata](#project-metadata)

---

## Configuration Changes

### Environment Configuration (`src/config/env.ts`)

**Changes Made:**

- Added new environment variable export: `NODE_ENV`
- This enables environment-specific behavior throughout the application

**Impact:** Allows the application to differentiate between development, staging, and production environments, enabling conditional feature toggles and security settings.

### Cookie Security Settings (`src/core/utils/cookies.ts`)

**Changes Made:**

- Modified `secure` cookie flag to be environment-aware: `NODE_ENV === "production"`
- Changed `sameSite` attribute from `"strict"` to `"none"` for improved cross-site request handling
- Enhanced `clearAuthCookie` function with proper cookie options matching the secure configuration

**Before:**

```typescript
res.cookie("access_token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 60 * 60 * 1000,
});
```

**After:**

```typescript
res.cookie("access_token", token, {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "none",
  maxAge: 60 * 60 * 1000,
});
```

**Security Note:** This change supports both development environments (where HTTPS may not be available) and production deployments, while maintaining CORS compatibility.

---

## Error Handling Improvements

### HttpError Class (`src/core/errors/HttpError.ts`)

**Changes Made:**

- Converted error properties to `readonly` to prevent accidental mutation
- Improved type safety: changed `errors` parameter type from `any` to `unknown`
- Added proper prototype chain setup using `Object.setPrototypeOf` for correct error inheritance
- Implemented stack trace capturing with `Error.captureStackTrace`
- Reorganized error code enums with updated mappings

**Error Code Updates:**
| Previous | New | HTTP Status |
|----------|-----|-------------|
| `UNPROCESSABLE_ENTITY = 2002` | `TOKEN_EXPIRED = 2002` | 401 |
| `INVALID_CREDENTIALS = 4001` | `UNAUTHORIZED = 4001` | 401 |
| `UNAUTHORIZED = 4003` | `FORBIDDEN = 4002` | 403 |
| — | `INVALID_CREDENTIALS = 4003` | 401 |
| — | `SELF_DEMOTION = 7001` | 409 |

**Benefit:** Ensures errors are properly recognized as instances of `HttpError` and child classes, fixing instanceof checks and enabling proper error serialization.

### Specialized Error Classes

**InternalError (`src/core/errors/InternalError.ts`)**

- Now accepts `ErrorCode` parameter with default `ErrorCode.INTERNAL_SERVER_ERROR`
- Improved constructor signature with proper type safety
- `errors` parameter now optional with `unknown` type

**UnauthorizedError (`src/core/errors/UnauthorizedError.ts`)**

- Added default message: `"Unauthorized"`
- Added default error code: `ErrorCode.UNAUTHORIZED`
- Now accepts optional `errors` parameter for error details
- Consistent with other error class patterns

**New Error Classes:**

**ConflictError (`src/core/errors/ConflictError.ts`)**

- Represents HTTP 409 Conflict responses
- Used for resource conflicts (e.g., duplicate entries, state conflicts)
- Primary use: Self-demotion prevention in user operations

**ForbiddenError (`src/core/errors/ForbiddenError.ts`)**

- Represents HTTP 403 Forbidden responses
- Default message: `"Permission denied to perform this action"`
- Supports optional error details for debugging

**Error Exports (`src/core/errors/index.ts`)**

- Added exports for new error classes: `ForbiddenError` and `ConflictError`
- Centralized error class exports for consistent importing

---

## Authentication & Authorization

### Token Middleware (`src/core/middlewares/token.middleware.ts`) - NEW

**Purpose:** Replaces the deleted `auth.middleware.ts` with enhanced functionality.

**Key Features:**

1. **Token Verification**: Validates JWT tokens from cookies
2. **Session Validation**: Verifies token exists in active sessions
3. **User Enrichment**: Fetches full user data including roles and permissions
4. **Error Handling**: Comprehensive error handling with try-catch
5. **Type Safety**: Properly typed user injection into Express request

**Implementation:**

```typescript
export const verifyToken = async (req, res, next) => {
  // Extracts token from cookies
  // Verifies JWT payload
  // Validates active session
  // Fetches user with roles populated
  // Attaches user to request object
};
```

**Security Note:** Ensures only requests with valid, active tokens are processed.

### Role Middleware (`src/core/middlewares/role.middleware.ts`) - NEW

**Purpose:** Controls access based on user roles.

**Usage:** Applied to endpoints that require role-based authorization (e.g., admin-only operations).

### Permission Middleware (`src/core/middlewares/permission.middleware.ts`) - NEW

**Purpose:** Enforces granular permission checks on operations.

**Scope Support:**

- `Read` (GET)
- `Write` (POST)
- `Update` (PATCH)
- `Delete` (DELETE)

### Permission Types (`src/modules/permission.type.ts`) - NEW

**Structure:**

```typescript
enum Method {
  GET,
  POST,
  PATCH,
  DELETE,
}
enum Scope {
  Read,
  Write,
  Update,
  Delete,
  UNKNOWN,
}

interface IPermission {
  method: Method;
  scope: Scope;
  permissions: string[];
}
```

**Default Permissions:** All HTTP methods require `admin_granted` permission by default.

### Auth Service Enhancements (`src/modules/auth/auth.service.ts`)

**Changes Made:**

- Converted private parameter injection to explicit private fields
- Added clarifying comment: `"this is the register method like create user"`
- Improved constructor readability with field initialization

**Refactored Constructor:**

```typescript
constructor(
  userRepository: IUserRepository,
  authRepository: IAuthRepository,
) {
  this.userRepository = userRepository;
  this.authRepository = authRepository;
}
```

### Auth Routes (`src/modules/auth/auth.routes.ts`)

**Changes Made:**

- Added `checkRole` middleware to registration endpoint
- Prevents unauthorized user registration
- Maintains existing login and logout functionality

```typescript
authRoutes.post("/register", checkRole, errorHandler(ctrl.register));
```

### Deleted File

**auth.middleware.ts** - Replaced by more sophisticated `token.middleware.ts` with:

- User data enrichment
- Better error handling
- Session validation improvements

---

## User Module Enhancements

### User Types (`src/modules/users/user.types.ts`)

**New Fields Added:**

- `permissions?: string[]` - Array of permission codes
- `roles?: IRole[]` - Array of Role references

**Type Relations:**

- User can have multiple roles
- User can have multiple permissions
- Both are optional to maintain backward compatibility

### User Model (`src/modules/users/user.model.ts`)

**New Schema Fields:**

```typescript
permissions: { type: [String], default: [] }
roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }]
```

**Cleanup:**

- Removed commented-out bcrypt code (using hash utility instead)
- Streamlined schema definition

**Benefits:**

- Direct role-user relationship via MongoDB references
- Efficient queries with populate()
- Default empty arrays prevent null issues

### User Repository (`src/modules/users/user.repository.ts`)

**Changes Made:**

- All query methods now include `.populate("roles")` to auto-fetch role data
- Affected methods:
  - `find()`
  - `findOne()`
  - `findById()`
  - `update()`

**Impact:** Users are always returned with their associated roles, eliminating N+1 queries.

### User Schema Validation (`src/modules/users/user.schema.ts`)

**Changes Made:**

- Added `roles` field (optional array of ObjectId) to `CreateUserInput`
- Added `roles` field (optional) to `UpdateUserInput`
- Added `permissions` field (optional array of strings) to `UpdateUserInput`
- Updated TypeScript comment references

**Validation Rules:**

- Roles must be valid MongoDB ObjectIds
- Permissions must be strings
- All new fields are optional

### User Controller (`src/modules/users/user.controller.ts`)

**New Imports:**

- `ConflictError` - For conflict scenarios
- `UnauthorizedError` - Enhanced error handling

**Enhanced createUser:**

- Better error message structure
- Uses `ErrorCode.INTERNAL_SERVER_ERROR` enum

**New updateUser Implementation:**

**Self-Demotion Prevention:**

```typescript
if (req.params.id === req.currentUser.id && userData.roles) {
  return next(
    new ConflictError(
      "User cannot modify their own roles",
      ErrorCode.SELF_DEMOTION,
    ),
  );
}
```

**Benefits:** Prevents users from accidentally or maliciously removing their admin roles.

**New deleteUser Implementation:**

**Self-Deletion Prevention:**

```typescript
if (req.params.id === req.currentUser.id) {
  return next(
    new ConflictError(
      "Users cannot delete their own account",
      ErrorCode.SELF_DEMOTION,
    ),
  );
}
```

**Benefits:** Prevents accidental account deletion and maintains at least one admin user.

**Improved Error Handling:**

- Consistent use of proper error classes
- NextFunction parameter added to update and delete handlers
- Proper null check handling with next() function

### User Routes (`src/modules/users/user.routes.ts`)

**Middleware Application:**

| Endpoint | Method | Middleware       | Purpose                                    |
| -------- | ------ | ---------------- | ------------------------------------------ |
| `/`      | POST   | `checkRole`      | Restrict user creation to authorized roles |
| `/`      | GET    | `getPermissions` | Check read permissions                     |
| `/:id`   | GET    | `getPermissions` | Check read permissions                     |
| `/:id`   | PATCH  | `checkRole`      | Restrict updates to authorized roles       |
| `/:id`   | DELETE | `getPermissions` | Check delete permissions                   |

---

## New Modules & Files

### Roles Module (`src/modules/roles/`) - NEW

**Structure:**

- `role.controller.ts` - Request handlers
- `role.model.ts` - MongoDB schema
- `role.repository.ts` - Data access layer
- `role.routes.ts` - Route definitions
- `role.schema.ts` - Zod validation schemas
- `role.service.ts` - Business logic
- `role.types.ts` - TypeScript interfaces
- `index.ts` - Module exports

**Purpose:** Complete role management system supporting RBAC functionality.

**Capabilities:**

- Create, read, update, delete roles
- Assign permissions to roles
- Assign roles to users

### HTTP Testing Files

**roles.http** - NEW

- Contains REST client examples for role operations
- Compatible with REST Client VS Code extension

**auth.http** - UPDATED

- Updated authentication tokens
- Changed test email to `admin.role@example.com`
- Updated registration test data

**users.http** - UPDATED

- Updated authentication tokens
- Updated test user IDs to match database state
- Updated test email addresses
- Removed test data payload from update endpoint

---

## Route Structure Updates

### Main Routes File (`src/routes.ts`)

**Changes Made:**

1. **Route Order Optimization:**
   - Auth routes defined first (no authentication required)
   - User routes after (requires token verification)
   - Role routes last (requires token verification and permissions)

2. **New Route Registration:**

   ```typescript
   router.use("/roles", verifyToken, getPermissions, roleRouter);
   ```

3. **Permission Middleware:**
   - Applied to role routes to enforce permission checks

**Route Flow:**

```
POST /api/v1/auth/register → checkRole
POST /api/v1/auth/login
POST /api/v1/auth/logout → verifyToken

GET/POST /api/v1/users → verifyToken, (conditional middleware per route)
GET/PATCH/DELETE /api/v1/users/:id → verifyToken, (conditional middleware per route)

GET/POST/PATCH/DELETE /api/v1/roles → verifyToken, getPermissions
```

---

## Testing Resources

### HTTP Client Requests

**Updated Test Credentials:**

- Admin user: `admin.role@example.com`
- Test user registration: `mariano.martinez@example.com`
- Includes updated JWT tokens for current session

**Available Test Endpoints:**

- User CRUD operations with role-based access
- Authentication flow (register, login, logout)
- Role management operations

**Usage:** These files can be used with REST Client extension in VS Code for API testing.

---

## Project Metadata

### .gitignore Updates

**Added Entries:**

- `mongodb/` - MongoDB container data
- `TODO.md` - Local task tracking
- Removed `src/core/middlewares/role.middleware.ts` from gitignore (now tracked)

**Current Ignored Patterns:**

- `node_modules/`
- `.env` files
- IDE files (`.vscode`, `.idea`)
- Build outputs
- Test coverage
- Database files

### Root Documentation

**branches/branch-6.md** - NEW

- Branch-specific documentation
- Tracks changes and progress

**TODO.md** - NEW

- Outstanding tasks and improvements
- Project roadmap items

---

## Security Considerations

### Authentication

✅ JWT token validation with session verification  
✅ Secure cookie handling with environment-aware flags  
✅ Password hashing with bcrypt utility

### Authorization

✅ Role-based access control (RBAC)  
✅ Permission-based resource access  
✅ Self-modification prevention (self-demotion)  
✅ Self-deletion prevention

### Error Handling

✅ Secure error messages (no sensitive data exposure)  
✅ Proper HTTP status codes  
✅ Error code enums for tracking  
✅ Stack trace capture for debugging

---

## Migration Guide

### For Developers

1. **Update Dependencies:** Ensure all MongoDB relationship helpers are installed
2. **Test Authentication:** Verify token verification flow with new enriched user data
3. **Test Authorization:** Test role and permission middleware on protected routes
4. **Update Client Code:** Clients should expect user responses to include roles array

### For DevOps

1. **Set NODE_ENV:** Ensure `NODE_ENV` environment variable is properly configured
2. **Cookie Configuration:** Review CORS settings as `sameSite: "none"` requires HTTPS in production
3. **Database Indexing:** Ensure MongoDB indexes on `roles` collection for performance

---
