# Authentication Guards Specification

## ADDED Requirements

### Requirement: JWT authentication guard
The system SHALL provide a JWT guard that validates incoming requests carry a valid JWT token.

#### Scenario: Valid token allows access
- **WHEN** request includes valid JWT token
- **THEN** request is allowed to proceed to handler

#### Scenario: Missing token blocks access
- **WHEN** request lacks Authorization header
- **THEN** system returns 401 Unauthorized

#### Scenario: Invalid token blocks access
- **WHEN** request includes malformed or expired token
- **THEN** system returns 401 Unauthorized

### Requirement: Route protection decorator
Protected routes SHALL use `@UseGuards(JwtAuthGuard)` decorator to require JWT authentication.

#### Scenario: Decorator application
- **WHEN** controller method decorated with `@UseGuards(JwtAuthGuard)`
- **THEN** JWT validation is required for that endpoint

#### Scenario: Public endpoint bypass
- **WHEN** endpoint marked with `@Public()` decorator
- **THEN** JWT guard does not block unauthenticated requests

### Requirement: User context injection
Authenticated endpoints SHALL have access to the current user's information from the JWT payload.

#### Scenario: Current user available in handler
- **WHEN** authenticated request reaches protected handler
- **THEN** handler receives user object with userId and email via `@GetUser()` decorator

### Requirement: Protected routes by default
All API routes SHALL require JWT authentication by default, except those explicitly marked as public.

#### Scenario: Activity endpoints protected
- **WHEN** unauthenticated request attempts to access `/api/activities`
- **THEN** system returns 401 Unauthorized

#### Scenario: Public login endpoint
- **WHEN** unauthenticated request accesses `/api/auth/login`
- **THEN** request proceeds without authentication
