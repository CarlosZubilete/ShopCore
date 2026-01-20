# Step-by-Step Implementation Guide

This guide walks through the authentication refactoring changes made in branch-5, explaining the "how" and "why" for each component.

---

## Step 1: Create Core Utility Functions for Password Hashing

### File: `src/core/utils/hash.ts`

**Why:** Instead of having password hashing logic scattered across models or controllers, we centralize it in one utility file. This makes it:

- **Easier to maintain**: Change hashing algorithm in one place
- **Easier to test**: Unit test hash functions independently
- **Easier to reuse**: Any module can import and use these functions
- **More secure**: Consistent hashing strategy across the app

**How it works:**

```typescript
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "@config/env";

// Hash a plain text password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = SALT_ROUNDS;
  return bcrypt.hash(password, saltRounds);
};

// Compare plain text password with hashed password
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
```

**Key points:**

- `hashPassword()`: Takes a plain password, adds salt (SALT_ROUNDS times), and returns encrypted hash
- `comparePassword()`: Takes plain password and hash, returns true if they match
- Both are async because bcrypt uses CPU-intensive algorithms
- Uses `SALT_ROUNDS` from environment config for consistency

---

## Step 2: Create Cookie Management Utilities

### File: `src/core/utils/cookies.ts`

**Why:** Cookies are more secure than sending tokens in response bodies because:

- **HttpOnly flag**: JavaScript can't access the cookie (prevents XSS attacks)
- **Secure flag**: Cookie only sent over HTTPS (prevents man-in-the-middle attacks)
- **SameSite**: Prevents CSRF attacks by restricting cross-origin cookie sending

**How it works:**

```typescript
import { Response } from "express";

// Set authentication token as a secure cookie
export const setAuthCookie = (res: Response, token: string) => {
  res.cookie("access_token", token, {
    httpOnly: true, // JavaScript cannot access this cookie (prevents XSS)
    secure: true, // Only sent over HTTPS (prevents MITM)
    sameSite: "strict", // Only sent to same site (prevents CSRF)
    maxAge: 60 * 60 * 1000, // Expires in 1 hour (3600000 milliseconds)
  });
};

// Clear the authentication cookie on logout
export const clearAuthCookie = (res: Response) => {
  res.clearCookie("access_token");
};
```

**Key points:**

- `setAuthCookie()`: Stores the JWT token in a secure, HttpOnly cookie
- `clearAuthCookie()`: Removes the cookie when user logs out
- `maxAge`: Set to 1 hour for security (tokens expire after 1 hour)
- All security flags enabled to protect against common attacks

---

## Step 3: Update User Model to Use Centralized Hashing

### File: `src/modules/users/user.model.ts`

**Why:** Instead of hashing passwords in the model using direct bcrypt imports, we use our centralized utility. This creates a clean separation of concerns.

**Before (problematic):**

```typescript
// Direct bcrypt import - not reusable, tightly coupled
UserSchema.pre<IUser>("save", async function () {
  if (this.isModified("password") || this.isNew) {
    const hashedPassword = await bcrypt.hash(this.password, SALT_ROUNDS);
    this.password = hashedPassword;
  }
});
```

**After (improved):**

```typescript
import { comparePassword, hashPassword } from "@core/utils/hash";

// Pre-save hook: Hash password before saving to database
UserSchema.pre<IUser>("save", async function () {
  if (this.isModified("password") || this.isNew) {
    const hashedPassword = await hashPassword(this.password);
    this.password = hashedPassword;
  }
});

// Schema method: Compare plain password with stored hash
UserSchema.method(
  "comparePassword",
  async function (password: string): Promise<boolean> {
    return comparePassword(password, this.password as string);
  },
);

// Hide password in JSON responses
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password; // Never send password in API responses
  return obj;
};
```

**Key points:**

- `pre("save")` hook automatically hashes password before MongoDB saves
- `comparePassword()` method allows calling `user.comparePassword(plainPassword)` on user instances
- `toJSON()` ensures password is never accidentally included in responses
- Removed direct bcrypt imports in favor of utility functions

---

## Step 4: Create Auth Types

### File: `src/modules/auth/auth.types.ts`

**Why:** Define interfaces for type safety. This ensures:

- **Type checking**: TypeScript catches errors at compile time
- **Documentation**: Interfaces serve as contract documentation
- **Consistency**: All code using these types follows same structure

```typescript
export interface IAuthRepository {
  create(data: any): Promise<any>;
  revoke(token: string): Promise<boolean>;
}

export interface IAuthService {
  login(email: string, password: string): Promise<string>;
  logout(token: string): Promise<boolean>;
  register(data: IUser): Promise<IUser>;
}
```

**Key points:**

- `IAuthRepository`: Defines what methods the auth repository must have
- `IAuthService`: Defines what methods the auth service must have
- Forces developers to follow the contract

---

## Step 5: Create Auth Schema for Validation

### File: `src/modules/auth/auth.schema.ts`

**Why:** Use Zod for runtime validation of incoming requests. This:

- **Validates data type**: Ensures email is string, password is string
- **Validates format**: Can ensure email format is valid
- **Prevents errors**: Catches bad data before it reaches business logic
- **Provides errors**: Returns clear error messages to client

```typescript
import { z } from "zod";

// Define what a valid login request looks like
export const LoginInput = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInputType = z.infer<typeof LoginInput>;
```

**Key points:**

- `z.object()`: Defines expected object structure
- `z.string().email()`: Ensures email format is valid
- `z.string().min(6)`: Ensures password minimum length
- `.parse()` method throws error if validation fails

---

## Step 6: Create Auth Repository

### File: `src/modules/auth/auth.repository.ts`

**Why:** Repository pattern separates data access logic from business logic. This:

- **Centralizes database queries**: All auth data operations in one place
- **Makes testing easier**: Can mock repository instead of database
- **Makes code reusable**: Can swap MongoDB for PostgreSQL by changing only this file
- **Improves maintainability**: Database changes only affect repository

```typescript
import { AuthModel } from "./auth.model";
import { IAuthRepository } from "./auth.types";

export class AuthRepository implements IAuthRepository {
  async create(data: any) {
    const auth = new AuthModel(data);
    return auth.save();
  }

  async revoke(token: string): Promise<boolean> {
    const result = await AuthModel.updateOne({ token }, { isRevoked: true });
    return result.modifiedCount > 0;
  }
}
```

**Key points:**

- `create()`: Saves new auth token to database
- `revoke()`: Marks token as revoked (logout)
- All MongoDB interactions happen here, nowhere else
- Easy to test by mocking this class

---

## Step 7: Create Auth Service

### File: `src/modules/auth/auth.service.ts`

**Why:** Service layer contains business logic (login/logout/register). This:

- **Separates concerns**: Controllers handle HTTP, services handle business logic
- **Makes testing easier**: Test business logic without HTTP layer
- **Makes code reusable**: Can use service in CLI, scheduled jobs, etc.
- **Improves readability**: Clear flow of authentication process

```typescript
import { IUserRepository } from "@modules/users";
import { IAuthRepository, IAuthService } from "./auth.types";
import { BadRequestError, ErrorCode } from "@core/errors";
import { signJwt } from "@core/utils/jwt";
import { comparePassword } from "@core/utils/hash";
import { IUser } from "@modules/users/user.types";

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private authRepository: IAuthRepository,
  ) {}

  // Login flow: find user → verify password → create token → save to database
  async login(email: string, password: string): Promise<string> {
    // 1. Find user by email
    const user = await this.userRepository.findOne({ email });

    // 2. Check if user exists AND password matches
    if (!user || !(await comparePassword(password, user.password)))
      throw new BadRequestError(
        "Invalid credentials",
        ErrorCode.INVALID_CREDENTIALS,
      );

    // 3. Generate JWT token
    const token = signJwt({ sub: user._id });

    // 4. Save token to database (for revocation tracking)
    await this.authRepository.create({
      token,
      userId: user._id,
    });

    // 5. Return token (will be sent as cookie in controller)
    return token;
  }

  // Logout flow: revoke token in database
  async logout(token: string): Promise<boolean> {
    return await this.authRepository.revoke(token);
  }

  // Register flow: create new user
  async register(data: IUser): Promise<IUser> {
    return this.userRepository.create(data);
  }
}
```

**Key points:**

- Constructor receives dependencies (Dependency Injection)
- `login()`: Complex logic with multiple steps
- `logout()`: Marks token as revoked
- `register()`: Delegates to user repository
- All business logic in one place, testable

---

## Step 8: Update Auth Controller

### File: `src/modules/auth/auth.controller.ts`

**Why:** Controller now delegates to service. This:

- **Simplifies controller**: Only handles HTTP (parsing requests, sending responses)
- **Separates concerns**: Controller ≠ business logic
- **Makes testing easier**: Test service without mocking Express
- **Makes code reusable**: Service can be used outside Express

```typescript
import { Request, Response } from "express";
import { IUser, UserRepository, UserService } from "@modules/users";
import { LoginInput } from "./auth.schema";
import { CreateUserInput } from "@modules/users/user.schema";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { setAuthCookie, clearAuthCookie } from "@core/utils/cookies";

const authRepository = new AuthRepository();
const userRepository = new UserRepository();
const authService = new AuthService(userRepository, authRepository);

// Login endpoint
export const login = async (req: Request, res: Response) => {
  // 1. Validate input using schema
  const { email, password } = LoginInput.parse(req.body);

  // 2. Call service to authenticate
  const token = await authService.login(email, password);

  // 3. Get user info (excluding password)
  const user = await userRepository.findOne({ email });

  // 4. Set token as secure cookie
  setAuthCookie(res, token);

  // 5. Return user info (password excluded by model's toJSON)
  res.json({ sub: user?._id, email: user?.email, username: user?.username });
};

// Register endpoint
export const register = async (req: Request, res: Response) => {
  // 1. Validate input
  const data = CreateUserInput.parse(req.body);

  // 2. Call service to create user (password auto-hashed by model)
  const newUser = await authService.register(data as IUser);

  // 3. Return created user
  res.status(201).json(newUser);
};

// Logout endpoint
export const logout = async (req: Request, res: Response) => {
  // 1. Get token from cookie
  const token = req.cookies.access_token;

  // 2. Revoke token in database
  const result = await authService.logout(token);

  if (!result) {
    return res.status(400).json({ message: "Failed to logout" });
  }

  // 3. Clear cookie
  clearAuthCookie(res);

  // 4. Return success message
  res.status(200).json({ message: "Logged out successfully" });
};
```

**Key points:**

- Controller is now ~40 lines instead of ~80 lines
- Each endpoint is now a simple 5-step flow
- Schema validation happens first (using Zod)
- Service handles complex business logic
- Cookie utility handles HTTP cookie management
- Controller only handles HTTP (request/response)

---

## Step 9: Add Token Verification Middleware

### File: `src/core/middlewares/auth.middleware.ts`

**Why:** Middleware checks if token is valid before allowing access to protected routes. This:

- **Protects routes**: Only authenticated users can access
- **Centralizes auth check**: All protected routes use same middleware
- **Improves security**: Invalid/revoked tokens rejected automatically

```typescript
import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "@core/errors";
import { verifyJwt } from "@core/utils/jwt";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Get token from cookie
    const token = req.cookies.access_token;

    // 2. Check if token exists
    if (!token) {
      throw new UnauthorizedError("No token provided", "NO_TOKEN");
    }

    // 3. Verify token signature and expiration
    const payload = verifyJwt(token);

    // 4. Attach user ID to request for use in route handlers
    req.user = { sub: payload.sub };

    // 5. Continue to next middleware/route
    next();
  } catch (err) {
    next(new UnauthorizedError("Invalid token", "INVALID_TOKEN"));
  }
};
```

**Key points:**

- Gets token from cookie (set by `setAuthCookie`)
- Verifies token signature (ensures token wasn't tampered with)
- Throws error if token invalid or missing
- Attaches user info to `req.user` for use in route handlers

---

## Step 10: Protect Routes with Middleware

### File: `src/routes.ts`

**Why:** Apply middleware to routes that require authentication.

```typescript
import { Router, Response } from "express";
import userRoutes from "@modules/users/user.routes";
import authRoutes from "@modules/auth/auth.routes";
import { verifyToken } from "@core/middlewares";

const router: Router = Router();

router.get("/healthy", (_, res: Response) => {
  res.json({ status: "API is healthy" });
});

// BEFORE: user routes were publicly accessible
// router.use("/users", userRoutes);

// AFTER: user routes now require authentication
router.use("/users", verifyToken, userRoutes);
router.use("/auth", authRoutes);

export default router;
```

**Key points:**

- `verifyToken` middleware runs before user routes
- Public routes (like `/auth/login`) don't have middleware
- Protected routes (like `/users`) require valid token
- Order matters: middleware must run before route handler

---

## Step 11: Update Package.json with New Dependencies

**Why:** Two new packages needed for our changes:

```json
{
  "dependencies": {
    "cookie-parser": "1.4.7", // Parse incoming cookies in requests
    "express-async-errors": "3.1.1" // Auto-catch async errors in routes
  },
  "devDependencies": {
    "@types/cookie-parser": "1.4.10" // TypeScript types for cookie-parser
  }
}
```

**Key points:**

- `cookie-parser`: Parses `Cookie` header, makes cookies available as `req.cookies`
- `express-async-errors`: Automatically catches Promise rejections in async route handlers
- `@types/cookie-parser`: TypeScript definitions for better IDE support

---

## Step 12: Update Server Configuration

### File: `src/server.ts`

**Why:** Initialize middleware to parse cookies and handle async errors.

```typescript
import express from "express";
import "express-async-errors"; // Auto-handle async errors
import cookieParser from "cookie-parser";
import morganMiddleware from "@core/middlewares/morgan.middleware";

const app = express();

// Parse incoming JSON
app.use(express.json());

// Parse incoming cookies (makes them available as req.cookies)
app.use(cookieParser());

// Request logging
app.use(morganMiddleware);

// Routes
app.use(routes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
```

**Key points:**

- `express-async-errors`: Imported at top, catches unhandled Promise rejections
- `cookieParser()`: Middleware that parses cookies and populates `req.cookies`
- `express.json()`: Parses JSON request bodies
- Error handler must be last middleware

---

## Data Flow Diagram

### Login Flow:

```
1. Client sends POST /auth/login { email, password }
   ↓
2. Controller validates input with Zod schema
   ↓
3. Controller calls authService.login(email, password)
   ↓
4. Service finds user by email in userRepository
   ↓
5. Service compares password with comparePassword()
   ↓
6. Service creates JWT token with signJwt()
   ↓
7. Service saves token to authRepository
   ↓
8. Controller receives token from service
   ↓
9. Controller calls setAuthCookie(res, token)
   ↓
10. Controller returns user info (no password)
   ↓
11. Client receives response with access_token cookie
```

### Protected Request Flow:

```
1. Client sends GET /users { with access_token cookie }
   ↓
2. Express parses cookie with cookieParser middleware
   ↓
3. verifyToken middleware gets token from req.cookies.access_token
   ↓
4. Middleware verifies token signature and expiration
   ↓
5. Middleware attaches user info to req.user
   ↓
6. Route handler receives request with req.user populated
   ↓
7. Route handler can use req.user.sub (user ID)
```

---

## Security Improvements

✅ **Passwords hashed with bcrypt**: Salted, cannot be reversed  
✅ **Passwords never sent in responses**: Model's toJSON excludes password  
✅ **Token stored in HttpOnly cookie**: JavaScript cannot access (prevents XSS)  
✅ **Cookie only sent over HTTPS**: Secure flag prevents MITM  
✅ **Token expires in 1 hour**: Limits damage from compromised tokens  
✅ **SameSite=strict**: Prevents CSRF attacks  
✅ **Tokens tracked in database**: Can revoke compromised tokens  
✅ **Input validation with Zod**: Prevents invalid data from reaching business logic

---

## Why Each Pattern?

| Pattern              | Why                                               |
| -------------------- | ------------------------------------------------- |
| Service Layer        | Separate business logic from HTTP handling        |
| Repository Pattern   | Abstract database operations, easy to test        |
| Middleware           | Centralize cross-cutting concerns (auth, logging) |
| Utility Functions    | DRY principle, reusable code                      |
| Zod Schemas          | Runtime validation, type safety                   |
| HttpOnly Cookies     | More secure than Authorization headers            |
| Dependency Injection | Loose coupling, easier testing                    |

---

## Testing Strategy

To test this code:

```typescript
// Test AuthService.login()
const mockUserRepo = { findOne: jest.fn() };
const mockAuthRepo = { create: jest.fn() };
const service = new AuthService(mockUserRepo, mockAuthRepo);

// Should throw error with invalid password
expect(() => service.login("test@test.com", "wrong")).toThrow();

// Should return token with valid password
const token = await service.login("test@test.com", "correct");
expect(token).toBeDefined();
```

---

## Next Steps

1. **Refresh Token**: Add refresh token mechanism to extend sessions
2. **Rate Limiting**: Prevent brute force attacks on login endpoint
3. **2FA**: Add two-factor authentication for enhanced security
4. **OAuth**: Add Google/GitHub login
5. **Session Management**: Track active sessions per user
