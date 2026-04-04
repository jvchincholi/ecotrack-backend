# User Entity Specification

## MODIFIED Requirements

### Requirement: User password storage
The User entity SHALL include a password field for storing bcrypt-hashed passwords.

#### Scenario: Password field exists
- **WHEN** User entity is inspected
- **THEN** entity contains hashed_password column in database

#### Scenario: Password hashing on create
- **WHEN** User entity is created
- **THEN** password is automatically hashed via bcrypt before database insert

### Requirement: Email uniqueness constraint
User email addresses SHALL be unique across all users to enable login by email.

#### Scenario: Unique email validation
- **WHEN** attempting to create user with existing email
- **THEN** database constraint prevents duplicate and returns error

### Requirement: User authentication timestamps
User entity SHALL track last login time and account creation for audit purposes.

#### Scenario: Last login tracking
- **WHEN** user successfully logs in
- **THEN** lastLoginAt timestamp is updated

#### Scenario: Account created timestamp
- **WHEN** user account is created
- **THEN** createdAt timestamp is recorded
