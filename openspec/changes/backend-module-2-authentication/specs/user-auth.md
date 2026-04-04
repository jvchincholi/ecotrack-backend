# User Authentication Specification

## ADDED Requirements

### Requirement: User registration with credentials
The system SHALL allow new users to register with email, password, first name, and last name.

#### Scenario: Successful registration
- **WHEN** user submits valid email and password
- **THEN** user account is created and password is securely hashed

#### Scenario: Duplicate email rejection
- **WHEN** user attempts to register with existing email
- **THEN** system returns 409 Conflict error

### Requirement: User login with JWT token
The system SHALL authenticate users by email and password, returning a JWT access token upon successful verification.

#### Scenario: Successful login
- **WHEN** user provides correct email and password
- **THEN** system returns JWT access token and refresh token

#### Scenario: Invalid credentials
- **WHEN** user provides incorrect email or password
- **THEN** system returns 401 Unauthorized error

### Requirement: Token refresh capability
The system SHALL allow authenticated users to refresh their access token using a refresh token.

#### Scenario: Successful token refresh
- **WHEN** user sends valid refresh token
- **THEN** system returns new access token

#### Scenario: Expired refresh token
- **WHEN** user sends expired refresh token
- **THEN** system returns 401 Unauthorized error

### Requirement: Token expiration
JWT access tokens SHALL expire after 1 hour, requiring users to refresh for continued access.

#### Scenario: Expired access token retry
- **WHEN** user attempts request with expired token
- **THEN** system returns 401 Unauthorized with token expiration message
