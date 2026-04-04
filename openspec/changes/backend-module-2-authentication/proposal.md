# Backend Module 2: Authentication - Proposal

## Why

The EcoTrack API requires secure user authentication to protect personal carbon footprint data and ensure that activity logs belong only to authorized users. JWT-based authentication with Passport.js provides a stateless, scalable solution for securing RESTful endpoints while maintaining the ability to issue access tokens that frontend clients can use for subsequent requests.

## What Changes

- Add JWT strategy with Passport.js for token-based authentication
- Create authentication endpoints for user login and token refresh
- Implement JWT guards to protect authenticated routes
- Add password hashing and validation using bcrypt
- Integrate authentication with existing User entity
- Secure all activity, analytics, and recommendation endpoints with JWT guards
- Generate OpenAPI/Swagger documentation for auth endpoints
- Support role-based access control foundation for future modules

## Capabilities

### New Capabilities
- `user-auth`: User authentication with JWT tokens (login, logout, token refresh)
- `jwt-strategy`: Passport.js JWT strategy configuration and validation
- `password-security`: Password hashing, validation, and bcrypt integration
- `auth-guards`: Route guards and decorators for protecting endpoints
- `auth-endpoints`: REST endpoints for authentication flows (/auth/login, /auth/register, /auth/refresh)

### Modified Capabilities
- `user-entity`: User entity extended with password field and authentication metadata

## Impact

- **New Dependencies**: `@nestjs/passport`, `passport-jwt`, `bcrypt`, `@types/bcrypt`
- **New Files**: `src/auth/` module with strategy, guard, controller, service
- **Modified Files**: `src/users/` module to integrate authentication service
- **API Changes**: All protected routes require Bearer token in Authorization header
- **Database**: User table potentially extended for password hashing and auth metadata

