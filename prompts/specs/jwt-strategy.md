# JWT Strategy Specification

## ADDED Requirements

### Requirement: JWT configuration
The system SHALL use JWT with HS256 algorithm signed with a secret key from environment variables.

#### Scenario: Valid JWT signing
- **WHEN** system generates token
- **THEN** token is signed with configured secret using HS256

#### Scenario: Token validation
- **WHEN** system validates incoming token
- **THEN** token signature is verified against secret

### Requirement: JWT payload structure
JWT tokens SHALL contain user ID and email as claims, with standardized `iat` (issued at) and `exp` (expiration) timestamps.

#### Scenario: Token payload inspection
- **WHEN** token is decoded
- **THEN** payload contains userId, email, iat, and exp claims

### Requirement: Bearer token extraction
The authentication system SHALL extract JWT tokens from the Authorization header with Bearer scheme.

#### Scenario: Valid Bearer header
- **WHEN** request includes `Authorization: Bearer <token>`
- **THEN** system extracts and validates token

#### Scenario: Missing Authorization header
- **WHEN** request does not include Authorization header
- **THEN** system returns 401 Unauthorized

#### Scenario: Invalid Authorization format
- **WHEN** Authorization header does not follow Bearer format
- **THEN** system returns 401 Unauthorized
