# Backend Module 2: Authentication - Implementation Tasks

## 1. Setup & Dependencies

- [ ] 1.1 Install bcrypt package: `pnpm add bcrypt @types/bcrypt`
- [ ] 1.2 Verify all auth dependencies installed (@nestjs/passport, @nestjs/jwt, passport-jwt)
- [ ] 1.3 Add JWT_SECRET and JWT_EXPIRATION to .env.example with guidance comments
- [ ] 1.4 Copy .env.example to .env and fill in actual values

## 2. Database Changes

- [ ] 2.1 Create new migration file for adding password to users table
- [ ] 2.2 Migration: Add `password` VARCHAR column with NOT NULL constraint
- [ ] 2.3 Migration: Add `lastLoginAt` TIMESTAMP column nullable
- [ ] 2.4 Run database migration: `pnpm run migration:run`
- [ ] 2.5 Verify users table schema updated in PostgreSQL

## 3. User Entity Updates

- [ ] 3.1 Update User entity: Add `password` field with @Column decorator
- [ ] 3.2 Update User entity: Add `lastLoginAt` field as nullable timestamp
- [ ] 3.3 Create BeforeInsert hook to hash password on User creation
- [ ] 3.4 Create BeforeUpdate hook to hash password on User updates
- [ ] 3.5 Add method to User entity for password validation (comparePassword)
- [ ] 3.6 Test user entity: Create user and verify password is hashed

## 4. Auth Module Structure

- [ ] 4.1 Create `src/auth/` directory structure
- [ ] 4.2 Generate auth module: `nest generate module auth`
- [ ] 4.3 Generate auth service: `nest generate service auth`
- [ ] 4.4 Generate auth controller: `nest generate controller auth`
- [ ] 4.5 Create `src/auth/strategies/` subdirectory
- [ ] 4.6 Create `src/auth/guards/` subdirectory
- [ ] 4.7 Create `src/auth/decorators/` subdirectory
- [ ] 4.8 Create `src/auth/dto/` subdirectory

## 5. Password Security Implementation

- [ ] 5.1 Create password validation service with complexity requirements
- [ ] 5.2 Implement password regex: 8+ chars, uppercase, lowercase, numbers
- [ ] 5.3 Create password hashing utility with bcrypt (10 rounds)
- [ ] 5.4 Create password comparison utility using bcrypt.compare()
- [ ] 5.5 Add password validation to registration DTO

## 6. JWT Strategy & Configuration

- [ ] 6.1 Create `src/auth/strategies/jwt.strategy.ts`
- [ ] 6.2 Implement JwtStrategy extending PassportStrategy(AuthGuard('jwt'))
- [ ] 6.3 Extract JWT secret from environment variables
- [ ] 6.4 Payload validation: Extract userId and email from token
- [ ] 6.5 Test JWT strategy: Generate test token and validate extraction

## 7. Guards & Decorators

- [ ] 7.1 Create `src/auth/guards/jwt-auth.guard.ts`
- [ ] 7.2 Implement JwtAuthGuard extending AuthGuard('jwt')
- [ ] 7.3 Create `src/auth/guards/jwt-refresh.guard.ts` for refresh endpoint
- [ ] 7.4 Create `src/auth/decorators/public.decorator.ts`
- [ ] 7.5 Create `src/auth/decorators/get-user.decorator.ts`
- [ ] 7.6 Set up global guard in AppModule

## 8. Auth DTOs

- [ ] 8.1 Create `src/auth/dto/register.dto.ts` with email, password, firstName, lastName
- [ ] 8.2 Add class-validator decorators to RegisterDto (email, password requirements)
- [ ] 8.3 Create `src/auth/dto/login.dto.ts` with email and password
- [ ] 8.4 Create `src/auth/dto/auth-response.dto.ts` with accessToken, refreshToken, user
- [ ] 8.5 Create `src/auth/dto/token-payload.dto.ts` for JWT payload structure

## 9. Auth Service Core Methods

- [ ] 9.1 Create AuthService in `auth.service.ts`
- [ ] 9.2 Implement `register()` method: Create user and hash password
- [ ] 9.3 Implement `login()` method: Validate credentials and generate tokens
- [ ] 9.4 Implement `validateUser()` method: Find user and compare password
- [ ] 9.5 Implement `generateAccessToken()` method: Create JWT with 1-hour expiry
- [ ] 9.6 Implement `generateRefreshToken()` method: Create JWT with 7-day expiry
- [ ] 9.7 Implement `refreshToken()` method: Validate and generate new access token
- [ ] 9.8 Implement `getCurrentUser()` method: Return user details from token
- [ ] 9.9 Inject UsersService into AuthService for user operations

## 10. Auth Controller Endpoints

- [ ] 10.1 Create `POST /api/auth/register` endpoint in AuthController
- [ ] 10.2 Add @Public() decorator to register endpoint
- [ ] 10.3 Implement register: Call authService.register() and return user + tokens
- [ ] 10.4 Create `POST /api/auth/login` endpoint
- [ ] 10.5 Add @Public() decorator to login endpoint
- [ ] 10.6 Implement login: Validate input, call authService.login()
- [ ] 10.7 Create `POST /api/auth/refresh` endpoint
- [ ] 10.8 Add JwtRefreshGuard to refresh endpoint
- [ ] 10.9 Implement refresh: Extract refresh token, call authService.refreshToken()
- [ ] 10.10 Create `GET /api/auth/me` endpoint
- [ ] 10.11 Implement /me: Return current user profile from @GetUser()
- [ ] 10.12 Add @UseGuards(JwtAuthGuard) to /me endpoint

## 11. Validation & Error Handling

- [ ] 11.1 Add input validation pipes to all DTO-based endpoints
- [ ] 11.2 Handle duplicate email error (409 Conflict)
- [ ] 11.3 Handle invalid credentials error (401 Unauthorized)
- [ ] 11.4 Handle expired token error (401 Unauthorized)
- [ ] 11.5 Create consistent error response format
- [ ] 11.6 Add proper HTTP status codes to all endpoints

## 12. Integration with Existing Modules

- [ ] 12.1 Import AuthModule into AppModule
- [ ] 12.2 Apply JwtAuthGuard globally in AppModule
- [ ] 12.3 Test: Protected endpoint fails without token
- [ ] 12.4 Test: Protected endpoint succeeds with valid token
- [ ] 12.5 Test: @Public() endpoint works without token

## 13. User Updates Module

- [ ] 13.1 Create UsersService with CRUD operations
- [ ] 13.2 Implement `findByEmail()` method
- [ ] 13.3 Implement `create()` method for user registration
- [ ] 13.4 Implement `findById()` method
- [ ] 13.5 Generate users controller if needed for future endpoints

## 14. Testing

- [ ] 14.1 Write unit test: Password hashing and comparison
- [ ] 14.2 Write unit test: JWT token generation and validation
- [ ] 14.3 Write integration test: Registration flow (register → verify user created)
- [ ] 14.4 Write integration test: Login flow (valid credentials → tokens returned)
- [ ] 14.5 Write integration test: Token refresh flow
- [ ] 14.6 Write integration test: Invalid credentials → 401 error
- [ ] 14.7 Write integration test: Expired token → 401 error
- [ ] 14.8 Write integration test: Protected endpoint without token → 401 error
- [ ] 14.9 Write integration test: @Public() endpoint accessible without token
- [ ] 14.10 Run full test suite: `pnpm run test`

## 15. Security & Compliance

- [ ] 15.1 Verify passwords never logged in debug output
- [ ] 15.2 Verify JWT secret not hardcoded or exposed
- [ ] 15.3 Verify error messages don't leak sensitive info (e.g., "user not found")
- [ ] 15.4 Add CORS configuration if needed for frontend access
- [ ] 15.5 Verify HTTPS enforced in production (documented in deployment guide)

## 16. Documentation

- [ ] 16.1 Add auth endpoint documentation in README.md
- [ ] 16.2 Document JWT configuration in environment section
- [ ] 16.3 Document authentication flow (register → login → bearer token)
- [ ] 16.4 Document rate limiting recommendations for Phase 2
- [ ] 16.5 Generate Swagger/OpenAPI docs via @ApiProperty decorators

## 17. Build & Deployment

- [ ] 17.1 Build project: `pnpm run build`
- [ ] 17.2 Fix any TypeScript compilation errors
- [ ] 17.3 Run linter: `pnpm run lint`
- [ ] 17.4 Start dev server: `pnpm run start:dev`
- [ ] 17.5 Test all auth endpoints manually (Postman/Insomnia)
- [ ] 17.6 Verify no console errors or warnings

## 18. Verification Against Specifications

- [ ] 18.1 Verify user-auth spec: Registration with credentials works ✅
- [ ] 18.2 Verify user-auth spec: Login returns JWT tokens ✅
- [ ] 18.3 Verify user-auth spec: Token refresh works ✅
- [ ] 18.4 Verify user-auth spec: Tokens expire correctly ✅
- [ ] 18.5 Verify jwt-strategy spec: Bearer token extraction works ✅
- [ ] 18.6 Verify jwt-strategy spec: Invalid Bearer format rejected ✅
- [ ] 18.7 Verify password-security spec: Passwords hashed with bcrypt ✅
- [ ] 18.8 Verify password-security spec: Password requirements enforced ✅
- [ ] 18.9 Verify auth-guards spec: Protected endpoints require token ✅
- [ ] 18.10 Verify auth-guards spec: @Public() endpoints accessible ✅
- [ ] 18.11 Verify auth-endpoints spec: All 4 endpoints exist and work ✅
- [ ] 18.12 Verify user-entity spec: User table has password field ✅

## 19. Final Review

- [ ] 19.1 Code review: Check all code is clear and follows NestJS patterns
- [ ] 19.2 Security review: Verify all security requirements met
- [ ] 19.3 Performance review: Verify password hashing performance acceptable
- [ ] 19.4 Test coverage: Verify all critical paths tested
- [ ] 19.5 Documentation: Verify all changes documented
- [ ] 19.6 Database: Verify migrations reversible and safe

## 20. Completion

- [ ] 20.1 All tasks above completed ✅
- [ ] 20.2 All tests passing
- [ ] 20.3 All specifications verified
- [ ] 20.4 Code pushed to branch
- [ ] 20.5 Ready for `openspec archive backend-module-2-authentication`
