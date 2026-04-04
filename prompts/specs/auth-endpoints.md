# Authentication Endpoints Specification

## ADDED Requirements

### Requirement: Registration endpoint
The system SHALL provide POST `/api/auth/register` endpoint for user registration.

#### Scenario: Successful registration
- **WHEN** client POSTs to `/api/auth/register` with valid credentials
- **THEN** system returns 201 Created with user ID and email

#### Scenario: Registration request payload
- **WHEN** client submits registration request
- **THEN** payload contains: email, password, firstName, lastName

#### Scenario: Registration validation errors
- **WHEN** client submits invalid registration data
- **THEN** system returns 400 Bad Request with validation details

### Requirement: Login endpoint
The system SHALL provide POST `/api/auth/login` endpoint for user authentication.

#### Scenario: Successful login
- **WHEN** client POSTs to `/api/auth/login` with correct credentials
- **THEN** system returns 200 OK with accessToken and refreshToken

#### Scenario: Login request payload
- **WHEN** client submits login request
- **THEN** payload contains: email, password

#### Scenario: Login failure
- **WHEN** client submits incorrect credentials
- **THEN** system returns 401 Unauthorized

### Requirement: Token refresh endpoint
The system SHALL provide POST `/api/auth/refresh` endpoint for token refresh.

#### Scenario: Successful token refresh
- **WHEN** client POSTs valid refresh token to `/api/auth/refresh`
- **THEN** system returns 200 OK with new accessToken

#### Scenario: Refresh token validation
- **WHEN** client submits expired or invalid refresh token
- **THEN** system returns 401 Unauthorized

### Requirement: Current user endpoint
The system SHALL provide GET `/api/auth/me` endpoint returning authenticated user's profile.

#### Scenario: Get current user profile
- **WHEN** authenticated client GETs `/api/auth/me`
- **THEN** system returns 200 OK with user profile (id, email, firstName, lastName)

#### Scenario: Unauthenticated request
- **WHEN** unauthenticated client GETs `/api/auth/me`
- **THEN** system returns 401 Unauthorized

### Requirement: API response format
All authentication endpoints SHALL return consistent JSON response format with data and error fields.

#### Scenario: Success response
- **WHEN** auth endpoint succeeds
- **THEN** response contains: `{ success: true, data: {...}, timestamp: "..." }`

#### Scenario: Error response
- **WHEN** auth endpoint fails
- **THEN** response contains: `{ success: false, error: "...", statusCode: 400, timestamp: "..." }`
