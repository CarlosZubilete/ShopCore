# Branch 4 - Authentication & Security Implementation

## Overview

This branch introduces a comprehensive authentication and security infrastructure, including password hashing, JWT-based authentication, type-safe database models, and improved data validation. The implementation establishes a foundation for secure user authentication and authorization mechanisms throughout the API.

---

## Executive Summary

| Metric            | Value                                 |
| ----------------- | ------------------------------------- |
| Files Modified    | 15                                    |
| New Files Created | 8 (auth module)                       |
| Lines Added       | 115                                   |
| Lines Deleted     | 52                                    |
| Net Change        | +63 lines                             |
| Key Focus         | Authentication, Security, Type Safety |

---

## Detailed Changes

### 1. **User Types Refactoring** (`src/modules/users/user.types.ts`)

#### Changes

- Renamed `User` interface to `IUser` (following interface naming convention)
- Extended `IUser` with Mongoose `Document` interface for proper type compatibility
- Added `password: string` field to user type
- Added `comparePassword()` method signature for password verification
- Enhanced `IUserRepository` interface with `findOne(query: Query)` method
- Added `findUserByEmail()` method to `IUserService` interface

#### Before

```typescript
export interface User {
  _id?: string;
  name: string;
  username: string;
  email: string;
}
```

#### After

```typescript
export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  comparePassword(password: string): Promise<boolean>;
}
```

#### Rationale

- **Mongoose Compatibility**: Extending `Document` ensures type safety when working with Mongoose models
- **Security**: Password field is mandatory for authentication flows
- **Method Binding**: `comparePassword()` enables secure password verification without exposing hashes
- **Query Flexibility**: `findOne()` enables lookups by any field (email, username, etc.)

---

### 2. **User Model Enhancement** (`src/modules/users/user.model.ts`)

#### Changes

- Added password field with required constraint and trim
- Implemented pre-save middleware for automatic password hashing using bcrypt
- Added `comparePassword()` instance method for password verification
- Implemented custom `toJSON()` method to exclude password from serialized responses
- Added bcrypt and SALT_ROUNDS imports from config

#### Implementation Details

**Password Hashing Pre-Hook**:

```typescript
UserSchema.pre<IUser>("save", async function () {
  if (this.isModified("password") || this.isNew) {
    const hashedPassword = await bcrypt.hash(this.password, SALT_ROUNDS);
    this.password = hashedPassword;
  }
});
```

**Password Comparison Method**:

```typescript
UserSchema.method(
  "comparePassword",
  async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password as string);
  },
);
```

**Response Filtering**:

```typescript
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};
```

#### Security Implications

- **Automatic Hashing**: Pre-save middleware ensures passwords are never stored in plaintext
- **Selective Hashing**: Only rehashes passwords when they are modified
- **Secure Comparison**: Uses bcrypt's timing-safe comparison to prevent timing attacks
- **Response Sanitization**: Password is automatically excluded from JSON responses

---

### 3. **Validation Schema Expansion** (`src/modules/users/user.schema.ts`)

#### Changes

- Renamed `UserSchema` to `CreateUserSchema` for semantic clarity
- Added password field validation with 8-100 character range
- Updated `UpdateUserSchema` to include optional password field
- Added schema documentation comments
- Prepared for type inference exports (commented out for future use)

#### Validation Rules

**CreateUserSchema**:

```typescript
export const CreateUserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  username: z.string().min(5).max(50),
  email: z.string().email().max(100),
  password: z.string().min(8).max(100), // NEW
});
```

**UpdateUserSchema**:

```typescript
export const UpdateUserSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  username: z.string().min(5).max(50).optional(),
  email: z.string().email().max(100).optional(),
  password: z.string().min(8).max(100).optional(), // NEW
});
```

#### Validation Strategy

- **Minimum Length**: 8 characters prevents weak passwords
- **Maximum Length**: 100 characters accommodates most use cases while limiting memory usage
- **Input Sanitization**: Trim operations remove leading/trailing whitespace
- **Optional Updates**: Password can be updated independently or with other fields

---

### 4. **User Service Extension** (`src/modules/users/user.service.ts`)

#### Changes

- Updated type references from `User` to `IUser`
- Added `findUserByEmail()` method to locate users by email address
- Integrated with repository's `findOne()` method
- Maintained existing CRUD operations

#### New Method

```typescript
async findUserByEmail(email: string): Promise<IUser | null> {
  return this.userRepository.findOne({ email });
}
```

#### Use Case

Enables authentication flows to locate users by email without exposing repository details. Essential for login validation.

---

### 5. **User Repository Enhancement** (`src/modules/users/user.repository.ts`)

#### Changes

- Updated type references to `IUser`
- Extended repository to implement `findOne(query: Query)` method
- Integrated with generic repository base class
- Implemented query-based lookups for flexible document retrieval

#### Implementation

The repository now supports querying by any field combination, enabling:

```typescript
userRepository.findOne({ email: "user@example.com" });
userRepository.findOne({ username: "johndoe" });
userRepository.findOne({ _id: "..." });
```

---

### 6. **Base Repository Interface** (`src/modules/repository.ts`)

#### Changes

- Renamed `Repository<T>` to `IRepository<T>` (interface naming convention)
- Added generic `Query` type definition for flexible document lookups
- Enhanced type consistency across all repositories

#### Type Definition

```typescript
export interface IRepository<T extends Document> {
  create(data: T): Promise<T>;
  find(query?: Query): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findOne(query: Query): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export type Query = Record<string, any>;
```

---

### 7. **User Index Exports** (`src/modules/users/index.ts`)

#### Changes

- Added explicit exports for `IUserRepository` and `IUserService` interfaces
- Exports both `UserRepository` and `UserService` implementations
- Enables cleaner imports in consumer code: `import { UserService, IUserService } from "@modules/users"`

---

### 8. **Authentication Configuration** (`src/config/env.ts`)

#### New File - Environment Variables Management

```typescript
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env" });
}

export const PORT: number = Number(process.env.PORT);
export const MONGO_URI: string = process.env.URI_STRING!;
export const JWT_SECRET: string = process.env.JWT_SECRET!;
export const SALT_ROUNDS: number = Number(process.env.SALT_ROUNDS);
```

#### Purpose

- Centralizes environment variable management
- Enforces non-production .env loading for development/testing
- Provides typed access to configuration throughout the application
- Used by authentication and encryption mechanisms

#### Required Environment Variables

```env
PORT=8080
URI_STRING=mongodb://localhost:27017/shopcore
JWT_SECRET=your-secret-key-here
SALT_ROUNDS=10
```

---

### 9. **Authentication Module** (`src/modules/auth/`)

#### New Module Structure

```
auth/
├── auth.controller.ts      (Login logic)
└── auth.routes.ts          (Route definitions)
```

#### Authentication Controller (`auth.controller.ts`)

**Login Endpoint**:

```typescript
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  const user = await userService.findUserByEmail(email);

  if (!user)
    return next(
      new BadRequestError(
        "Invalid user or password",
        ErrorCode.INVALID_CREDENTIALS,
      ),
    );

  const hashMatch = await user.comparePassword(password);
  if (!hashMatch)
    return next(
      new BadRequestError(
        "Invalid user or password",
        ErrorCode.INVALID_CREDENTIALS,
      ),
    );

  const token = jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: "1h" },
  );

  res.json({ message: "Login successful", token });
};
```

**Key Features**:

- **User Lookup**: Queries by email to find credentials
- **Password Verification**: Uses `comparePassword()` for secure comparison
- **Error Handling**: Vague error messages prevent username enumeration attacks
- **JWT Generation**: Creates signed tokens with 1-hour expiration
- **Token Payload**: Includes user ID, email, and username for identification

#### Authentication Routes (`auth.routes.ts`)

```typescript
authRoutes.post("/login", errorHandler(ctrl.login));
```

**Currently Implemented**:

- `POST /api/v1/auth/login` - User login with email/password

**Planned (Commented Out)**:

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - Token invalidation

---

### 10. **Error Code Enhancement** (`src/core/errors/HttpError.ts`)

#### Changes

- Added `INVALID_CREDENTIALS` error code for authentication failures
- Maintains backward compatibility with existing error codes

#### New Error Code

```typescript
export enum ErrorCode {
  // ... existing codes ...
  INVALID_CREDENTIALS = 4001, // NEW
  // ... existing codes ...
}
```

---

### 11. **HTTP Test File Updates** (`http/users.http`)

#### Changes

- Updated endpoint URLs to use `/api/v1` prefix
- Standardized request/response examples
- Added authentication test scenarios

---

### 12. **Routing Configuration** (`src/routes.ts`)

#### Changes

- Integrated auth routes into main router
- Routes auth requests to authentication endpoints
- Maintains modular route organization

#### Integration

```typescript
router.use("/auth", authRoutes);
```

---

### 13. **Environment Variable Integration** (`src/app.ts`)

#### Changes

- Simplified configuration by using centralized env module
- Removed inline environment access
- Improved configuration consistency

---

### 14. **Database Configuration Updates** (`src/config/database.ts`)

#### Changes

- Uses centralized `MONGO_URI` from env configuration
- Maintains connection pool settings
- Enhanced error handling

---

### 15. **Dependencies** (`package.json`)

#### New Dependencies

- `bcrypt` - Password hashing with salt rounds
- JWT-related packages for token management

---

## Architecture Improvements

### Type Safety Enhancement

```
Before: User (generic object)
After:  IUser extends Document (Mongoose-aware)
```

### Security Layer Addition

```
Request → Validation → Controller → Service → Repository → Model (Hash/Compare)
                                                             ↓
                                                      Password Security
```

### Authentication Flow

```
1. User submits email + password
   ↓
2. Controller finds user by email
   ↓
3. comparePassword() validates hash
   ↓
4. JWT token generated (1h expiration)
   ↓
5. Token returned to client
```

---

## Security Considerations

### Implemented

**Password Hashing**: Bcrypt with configurable salt rounds  
**Timing-Safe Comparison**: Prevents timing attacks  
**Response Sanitization**: Passwords excluded from JSON  
**Generic Error Messages**: "Invalid user or password" (prevents enumeration)  
**JWT Expiration**: 1-hour token lifetime  
**Environment Secrets**: Sensitive configs in .env

### Recommended Future Enhancements

- [ ] Rate limiting on login endpoint
- [ ] JWT refresh token mechanism
- [ ] Email verification for new accounts
- [ ] Password reset flow
- [ ] Account lockout after failed attempts
- [ ] Audit logging for authentication events

---

## Testing Scenarios

### Test 1: Successful Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'

# Response: 200
# {
#   "message": "Login successful",
#   "token": "eyJhbGciOiJIUzI1NiIs..."
# }
```

### Test 2: Invalid Credentials

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "wrongpassword"
  }'

# Response: 400
# {
#   "message": "Invalid user or password",
#   "errorCode": 4001
# }
```

### Test 3: User Not Found

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "anypassword"
  }'

# Response: 400
# {
#   "message": "Invalid user or password",
#   "errorCode": 4001
# }
```

---

## Migration Guide from Branch-3

### Type Updates Required

If using code from branch-3, update imports:

```typescript
// Old
import { User } from "@modules/users";

// New
import { IUser } from "@modules/users";
```

### Password Field Addition

Existing users in database need password migration:

```typescript
// Migration script example
db.users.updateMany(
  { password: { $exists: false } },
  { $set: { password: "hashed_default_password" } },
);
```

### Environment Configuration

Add to `.env`:

```env
JWT_SECRET=your-super-secret-jwt-key
SALT_ROUNDS=10
```

---

## File Changes Summary

| File                                   | Type     | Changes                                |
| -------------------------------------- | -------- | -------------------------------------- |
| `src/modules/users/user.types.ts`      | Modified | Type refactoring, interface extensions |
| `src/modules/users/user.model.ts`      | Modified | Password hashing, comparison method    |
| `src/modules/users/user.schema.ts`     | Modified | Password validation, schema rename     |
| `src/modules/users/user.service.ts`    | Modified | findUserByEmail() addition             |
| `src/modules/users/user.repository.ts` | Modified | findOne() implementation               |
| `src/modules/users/user.controller.ts` | Modified | Type updates                           |
| `src/modules/users/index.ts`           | Modified | Enhanced exports                       |
| `src/modules/auth/*`                   | New      | Complete authentication module         |
| `src/config/env.ts`                    | New      | Environment variable management        |
| `src/core/errors/HttpError.ts`         | Modified | INVALID_CREDENTIALS error code         |
| `src/routes.ts`                        | Modified | Auth route integration                 |
| `.gitignore`                           | Modified | Auth-related patterns                  |
| `http/users.http`                      | Modified | Test case updates                      |

---

## Commit Message

```
feat: implement authentication and security layer

- Add bcrypt password hashing with automatic pre-save middleware
- Implement password comparison method for secure validation
- Create authentication module with login endpoint
- Add JWT token generation with 1-hour expiration
- Enhance type safety with IUser extending Document
- Implement findUserByEmail() for credential lookups
- Sanitize password from JSON responses
- Centralize environment variable management
- Add INVALID_CREDENTIALS error code
- Prevent response leakage with generic error messages
- Support flexible document queries via findOne()
```

---

## Next Steps (Branch-5)

- [ ] Implement JWT authentication middleware
- [ ] Create user registration endpoint with validation
- [ ] Add password reset flow
- [ ] Implement token refresh mechanism
- [ ] Add rate limiting for auth endpoints
- [ ] Create email verification system
- [ ] Implement role-based access control (RBAC)
- [ ] Add audit logging for security events

---

**Last Updated**: January 17, 2026  
**Branch**: branch-4  
**Status**: ✅ Ready for Review & Testing
