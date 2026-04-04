# OpenSpec Workflow: Backend Authentication Module

## Overview
This document captures the OpenSpec Specification-Driven Development (SDD) workflow for Backend Module 2: Authentication for the EcoTrack backend API.

## Workflow Steps (Option 3: Step-by-Step Guided Development)

1. **Initialize Change**: `openspec new change backend-module-2-authentication`
2. **Create Proposal**: Define WHY, WHAT, and Capabilities
3. **Write Specifications**: Define requirements and scenarios for each capability
4. **Design Architecture**: Technical design document (TODO)
5. **Create Tasks**: Break down into actionable implementation tasks
6. **Implement Code**: Write the actual NestJS code
7. **Verify**: Validate implementation matches specs
8. **Archive**: Finalize change and merge into main specs

## Change Created
- **Name**: `backend-module-2-authentication`
- **Location**: `openspec/changes/backend-module-2-authentication/`
- **Schema**: `spec-driven`

## Key Commands
```bash
# View change status
openspec status --change backend-module-2-authentication

# Get instructions for next artifact
openspec instructions design --change backend-module-2-authentication

# Validate the change
openspec validate backend-module-2-authentication

# Archive when complete
openspec archive backend-module-2-authentication
```

## Artifacts Created

### 1. Proposal ✅
File: `proposal.md`
- Defined the WHY (security for user data)
- Listed WHAT CHANGES (JWT, guards, endpoints, etc.)
- Identified NEW CAPABILITIES (5 capabilities)
- Identified MODIFIED CAPABILITIES (user-entity)
- Described IMPACT (dependencies, affected files)

### 2. Specifications ✅
Five spec files covering all capabilities:

1. **user-auth.md** - User registration, login, token refresh
2. **jwt-strategy.md** - JWT configuration and Bearer token extraction
3. **password-security.md** - Password hashing, validation, requirements
4. **auth-guards.md** - Route protection and user context injection
5. **auth-endpoints.md** - REST endpoints (/auth/register, /login, /refresh, /me)
6. **user-entity.md** - User table password field and authentication metadata

Each specification includes:
- Requirements (SHALL/MUST statements)
- Scenarios (WHEN/THEN test cases)
- Implementation guidance

### 3. Next Artifact: Design (TODO)
Create technical design document covering:
- Architecture and file structure
- NestJS module organization
- JWT configuration details
- Password hashing implementation
- Database migration strategy
- API response formats

## Capabilities Defined

### New Capabilities
- `user-auth` - JWT token-based authentication
- `jwt-strategy` - Passport.js JWT strategy
- `password-security` - Bcrypt password hashing
- `auth-guards` - Route protection decorators
- `auth-endpoints` - REST authentication endpoints

### Modified Capabilities
- `user-entity` - Extended with password field

## Status
- ✅ Proposal: Complete
- ✅ Specifications: Complete
- ⏳ Design: Pending (required before Tasks)
- ⏳ Tasks: Pending (depends on Design)
- ⏳ Implementation: Pending
- ⏳ Verification: Pending
- ⏳ Archive: Pending
