# Quick Reference Guide

## What Was Accomplished

### ✅ Module 1: Database & Entities (Complete)
- NestJS project bootstrapped
- PostgreSQL/TypeORM configured
- 3 entities created: User, Activity, EmissionFactor
- Initial migration created
- All dependencies installed
- Project builds successfully

### ✅ Module 2: Authentication - Specification Phase (Complete)
- OpenSpec CLI installed (v1.1.1)
- Change created: `backend-module-2-authentication`
- Proposal written (WHY, WHAT, Capabilities, Impact)
- 6 specifications written with requirements & scenarios
- Ready for Design phase

---

## File Organization

### Prompts Folder Structure
```
/prompts/
├── 01-WORKFLOW-OVERVIEW.md      👈 Start here
├── 02-PROPOSAL.md               👈 What we're building
├── SESSION-LOG.md               👈 Full session details
├── QUICK-REFERENCE.md           👈 This file
├── openspec.yaml                👈 Main spec config
└── specs/                       👈 6 specification files
    ├── user-auth.md
    ├── jwt-strategy.md
    ├── password-security.md
    ├── auth-guards.md
    ├── auth-endpoints.md
    └── user-entity.md
```

### OpenSpec Change Location
```
/openspec/changes/backend-module-2-authentication/
├── proposal.md                  ✅
├── specs/                       ✅
│   ├── user-auth.md
│   ├── jwt-strategy.md
│   ├── password-security.md
│   ├── auth-guards.md
│   ├── auth-endpoints.md
│   └── user-entity.md
├── design.md                    ⏳ Next
├── tasks.md                     ⏳ After design
└── implementation.md            ⏳ After tasks
```

---

## Key Specs Summary

| Spec | Key Requirements |
|------|-----------------|
| **user-auth.md** | Registration, login, token refresh, 1hr expiry |
| **jwt-strategy.md** | HS256 algorithm, Bearer token extraction |
| **password-security.md** | Bcrypt min 10 rounds, 8+ char with complexity |
| **auth-guards.md** | Protected by default, guard decorator pattern |
| **auth-endpoints.md** | 4 endpoints: /register, /login, /refresh, /me |
| **user-entity.md** | Password field, email unique, lastLoginAt tracking |

---

## OpenSpec Workflow Phases

```
Phase 1: Planning ✅
├── Change created
├── Proposal written
└── Specifications defined

Phase 2: Design (Next)
├── Technical architecture
├── File structure
├── Implementation approach
└── Database migrations

Phase 3: Implementation (Then)
├── Create NestJS modules
├── Implement services
├── Create controllers
├── Add guards & decorators
└── Database migrations

Phase 4: Verification (Finally)
├── Test against specs
├── Verify scenarios
├── Check compliance
└── Archive change

Phase 5: Merge (Complete)
├── Archive change
├── Merge to main specs
└── Module 2 complete
```

---

## Immediate Next Steps

### 1. Generate Design Document
```bash
cd /Users/jayanthchincholi/Documents/mywork/personal/ecotrack-backend
openspec instructions design --change backend-module-2-authentication
```

**Include in design.md:**
- Module structure: `src/auth/`, `src/users/`
- JWT configuration: secret, expiry times
- Bcrypt setup: salt rounds, cost factor
- API response format
- Database migration strategy
- File layout and responsibilities

### 2. Generate Tasks (After Design)
```bash
openspec instructions tasks --change backend-module-2-authentication
```

**Tasks will include:**
- Module scaffolding
- Service implementations
- Controller endpoints
- Guards and decorators
- Database updates
- Testing and verification

### 3. Check Status Anytime
```bash
openspec status --change backend-module-2-authentication
```

---

## Key Capabilities Being Built

### 1. User Authentication
- Email + password login
- JWT token generation
- Token refresh mechanism
- Stateless, scalable security

### 2. Password Security
- Bcrypt hashing (10+ rounds)
- Validation requirements (8+, uppercase, lowercase, numbers)
- Never store plaintext
- Prepared for password reset

### 3. Route Protection
- Guards protect all routes by default
- `@Public()` decorator for exceptions
- User context injection via `@GetUser()`
- 401/403 error handling

### 4. API Endpoints
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get tokens
- `POST /api/auth/refresh` - Renew access token
- `GET /api/auth/me` - Current user profile

---

## Important Decisions

✅ **JWT over Sessions**: Stateless, microservice-friendly
✅ **Bcrypt over plaintext**: Industry standard security
✅ **Guards by default**: Fail-secure approach
✅ **Passport.js**: Standard NestJS integration
✅ **Separate auth module**: Modularity and testability

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | NestJS v10.4.22 |
| **ORM** | TypeORM v0.3.28 |
| **Database** | PostgreSQL v16 |
| **Auth** | Passport.js + JWT |
| **Password** | Bcrypt v5+ |
| **Language** | TypeScript v5.9.3 |
| **Package Manager** | pnpm v10.29.3 |

---

## Environment Variables (See `.env.example`)

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=ecotrack_user
DB_PASSWORD=ecotrack_dev_2026
DB_NAME=ecotrack_db
JWT_SECRET=your_jwt_secret_here
```

---

## Useful Commands

### Development
```bash
pnpm run start:dev          # Start server in watch mode
pnpm run build              # Compile TypeScript
pnpm run lint               # Run ESLint
pnpm run test               # Run Jest tests
```

### Database
```bash
pnpm run migration:run      # Run pending migrations
pnpm run migration:revert   # Revert last migration
pnpm run seed               # Seed sample data
```

### OpenSpec
```bash
openspec show backend-module-2-authentication       # View current state
openspec status --change backend-module-2-authentication  # Check progress
openspec validate backend-module-2-authentication   # Validate artifacts
openspec instructions <artifact> --change backend-module-2-authentication  # Get guidance
```

---

## Contact & Support

For questions about:
- **OpenSpec workflow** → Review 01-WORKFLOW-OVERVIEW.md
- **Specifications** → Check prompts/specs/ folder
- **Session history** → See SESSION-LOG.md
- **Next steps** → Follow Immediate Next Steps above
