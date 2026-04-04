# Backend Module 2: Authentication - Technical Design

## Context

EcoTrack needs to secure user access to the API and protect personal carbon footprint data. Module 1 established the database foundation with User, Activity, and EmissionFactor entities. Module 2 adds authentication to prevent unauthorized access.

**Current State:**
- User entity exists with basic fields (email, firstName, lastName, avatar)
- No security layer on endpoints
- No password field in User table
- All data is publicly accessible

**Constraints:**
- Must maintain stateless architecture for scalability
- NestJS framework already chosen
- PostgreSQL database already configured with TypeORM
- No external authentication services (OAuth, LDAP) initially
- Must work with existing entity relationships

**Stakeholders:**
- Frontend: Needs login endpoints and token refresh capability
- API Clients: Need Bearer token authentication
- Database: User table must support password storage
- DevOps: Deployment without downtime

---

## Goals / Non-Goals

### Goals
1. ✅ Implement stateless JWT-based authentication
2. ✅ Secure all endpoints with route guards
3. ✅ Store passwords encrypted with bcrypt
4. ✅ Provide token refresh capability for long sessions
5. ✅ Support user registration and login
6. ✅ Enable future role-based access control (RBAC)
7. ✅ Maintain API consistency with existing modules
8. ✅ Generate OpenAPI/Swagger documentation

### Non-Goals
- ❌ OAuth/OpenID Connect integration (Phase 2)
- ❌ Two-Factor Authentication (Phase 3)
- ❌ SAML/LDAP enterprise authentication (Phase 3)
- ❌ Password reset via email (Phase 2)
- ❌ Social login providers (Phase 3)
- ❌ Session management / sticky sessions
- ❌ API key authentication (separate module)

---

## Decisions

### Decision 1: JWT Over Session-Based Authentication

**Choice:** JWT with Bearer tokens

**Rationale:**
- Stateless: Server doesn't need token storage
- Scalable: Works across multiple instances
- Microservice-friendly: Token can be validated anywhere
- Standard for REST APIs: Industry best practice

**Alternatives Considered:**
- ❌ Sessions: Requires session store, not scalable
- ❌ OAuth2: Overkill for internal API
- ❌ API Keys: Not suitable for user authentication

**Implementation:**
- Access token: 1-hour expiry for security
- Refresh token: 7-day expiry for convenience
- Both tokens created at login
- Only refresh token valid for /auth/refresh endpoint

---

### Decision 2: Passport.js with JWT Strategy

**Choice:** Use `@nestjs/passport` + `@nestjs/jwt` + `passport-jwt`

**Rationale:**
- NestJS native integration
- Standard Passport.js ecosystem
- Proven in production systems
- Easy to extend for future auth methods
- Clear strategy pattern

**Alternatives Considered:**
- ❌ Manual JWT verification: Reinvents the wheel, error-prone
- ❌ Custom middleware: Less maintainable than Passport strategies
- ❌ Third-party services: Adds external dependency

**Implementation:**
- Create `JwtStrategy` extending `PassportStrategy`
- Validate token and extract userId/email
- Attach decoded token to request object
- Use guards for route protection

---

### Decision 3: Bcrypt for Password Hashing

**Choice:** Bcrypt with minimum 10 salt rounds

**Rationale:**
- Computationally expensive: Resists brute force
- Auto salt generation: Doesn't require separate salt management
- Proven algorithm: Industry standard for 15+ years
- Built-in cost factor: Adapts to hardware improvements

**Alternatives Considered:**
- ❌ MD5/SHA256: Not suitable for passwords
- ❌ Scrypt/Argon2: Overkill for current scale
- ❌ PBKDF2: Older than bcrypt, requires more tuning

**Implementation:**
- Install `bcrypt` package
- Hash at User.create() via ORM lifecycle hook
- Hash cost: 10 rounds (≈100ms per hash on modern CPU)
- Update User entity to mark password field

**Performance Consideration:**
- ⚠️ Each login takes 100-200ms for password verification
- Acceptable for authentication frequency (not in request loop)

---

### Decision 4: Guards by Default Pattern

**Choice:** All routes protected by default, explicit public routes

**Rationale:**
- Fail-secure by default
- Login/register endpoints explicitly marked @Public()
- Everything else requires JWT
- Reduces security audit surface

**Alternatives Considered:**
- ❌ No guards by default: Accidentally expose endpoints
- ❌ Manual guard per endpoint: Repetitive and error-prone
- ❌ Role-based access: Premature optimization

**Implementation:**
- Create `JwtAuthGuard` extending `AuthGuard('jwt')`
- Create `@Public()` decorator for exceptions
- Apply global guard in `AppModule`
- @Public() decorator prevents guard execution

---

### Decision 5: Separate Auth Module

**Choice:** Create dedicated `src/auth/` module

**Rationale:**
- Clear separation of concerns
- Auth logic isolated from user management
- Easier to test in isolation
- Maintains modularity pattern

**Module Responsibilities:**
- Authentication service: JWT generation/validation
- Strategies: JWT strategy configuration
- Guards: Route protection logic
- Controllers: Auth endpoints
- DTOs: Request/response validation

**User Module Responsibilities:**
- User service: User CRUD operations
- Entities: User data model
- DTOs: User data transfer

**Architecture:**
```
src/
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── jwt-refresh.guard.ts
│   ├── decorators/
│   │   ├── public.decorator.ts
│   │   └── get-user.decorator.ts
│   └── dto/
│       ├── login.dto.ts
│       ├── register.dto.ts
│       └── auth-response.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   ├── entities/
│   │   └── user.entity.ts
│   └── dto/
│       └── user-response.dto.ts
```

---

### Decision 6: Environment-Based Configuration

**Choice:** JWT secret and expiry times from environment variables

**Rationale:**
- No secrets in source code
- Different values per environment
- Easy rotation without redeployment

**Environment Variables:**
```
JWT_SECRET=your_secret_key_here                  # 32+ char secret
JWT_EXPIRATION=3600                              # Access token: 1 hour
JWT_REFRESH_EXPIRATION=604800                    # Refresh token: 7 days
```

**Alternatives Considered:**
- ❌ Hardcoded values: Security risk
- ❌ Vault service: Not needed at this scale

---

### Decision 7: DTO Validation with class-validator

**Choice:** Use `class-validator` decorators for input validation

**Rationale:**
- Already installed for other modules
- Works with NestJS pipes
- Declarative and maintainable
- Clear error messages

**Example DTOs:**
```typescript
class LoginDto {
  @IsEmail()
  email: string;
  
  @IsString()
  @MinLength(8)
  password: string;
}
```

---

### Decision 8: Error Handling Strategy

**Choice:** Consistent HTTP status codes and error format

**Rationale:**
- Clear client feedback
- Standards-based (RFC 7231, 7235)
- Easy debugging and logging

**Status Codes:**
- `200 OK`: Successful login/refresh
- `201 Created`: Successful registration
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Invalid credentials or expired token
- `409 Conflict`: Email already exists
- `500 Internal Server Error`: Unexpected errors

**Error Response Format:**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "statusCode": 401,
  "timestamp": "2026-04-04T21:00:00.000Z"
}
```

---

## Risks / Trade-offs

### Risk 1: Token Leakage in Transit
**Scenario:** Attacker intercepts JWT token over HTTP
**Mitigation:** 
- ✅ HTTPS required in production
- ✅ Environment-based configuration
- ✅ Security headers (HSTS) in reverse proxy

---

### Risk 2: Weak Secrets in Development
**Scenario:** Developer uses weak JWT secret, gets exposed in logs
**Mitigation:**
- ✅ Provide .env.example with guidance
- ✅ Document secret requirements (32+ chars)
- ✅ Rotate secrets regularly

---

### Risk 3: Password Reuse/Weak Passwords
**Scenario:** User picks weak password, account compromised
**Mitigation:**
- ✅ Password requirements enforced (8+ chars, mixed case, numbers)
- ✅ Rate limiting on login attempts (Phase 2)
- ✅ Password reset recovery (Phase 2)

---

### Risk 4: Bcrypt Performance on High Load
**Scenario:** Many simultaneous logins slow down server
**Mitigation:**
- ✅ 10 rounds is balanced (100-200ms acceptable for auth)
- ✅ Can reduce to 8 rounds if needed (0.05ms per additional round)
- ✅ Cache verified users briefly (Phase 2)
- ✅ Implement queue system for auth requests (Phase 3)

---

### Risk 5: Token Expiry Complexity
**Scenario:** Tokens expire during long user sessions
**Mitigation:**
- ✅ Refresh token allows silent renewal
- ✅ Frontend handles 401 with automatic refresh
- ✅ 1-hour access token balances security/UX

---

### Risk 6: Refresh Token Storage
**Scenario:** Refresh tokens need to be managed/revoked
**Current Approach:** No revocation needed (stateless)
**Future:** May need token blacklist (Phase 2)

---

### Trade-off 1: Stateless vs. Token Revocation
**Trade-off:** Stateless design prevents immediate token revocation
**Decision:** Accept for Phase 1, implement blacklist in Phase 2
**Impact:** Users can't log out others, logout only clears client-side token

---

### Trade-off 2: Password Hashing Performance
**Trade-off:** 10 bcrypt rounds takes 100-200ms (slower login)
**Decision:** Security over speed (passwords worth the cost)
**Impact:** Login endpoint responds in ~150-300ms total

---

### Trade-off 3: JWT Size
**Trade-off:** Adding more claims increases token size
**Decision:** Keep minimal (userId, email only)
**Impact:** Token ≈200-300 bytes, acceptable for Bearer header

---

## Migration Plan

### Step 1: Database Migration
Create migration to add password field to users table:

```sql
ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';
-- Update placeholder, then remove default
UPDATE users SET password = '' WHERE password = '';
-- Add check constraint for future inserts
ALTER TABLE users ADD CONSTRAINT check_password_length CHECK (LENGTH(password) > 0);
```

**Execution:** Before deploying auth code

---

### Step 2: Code Deployment
1. Deploy auth module code
2. API still works without auth (guards not enforced)
3. New endpoints available: /auth/register, /auth/login

**Execution:** No downtime

---

### Step 3: Enable Guards
Global guard applied in AppModule:
- All routes protected except @Public() decorated
- Requires clients to add Authorization header

**Execution:** Single deployment, backward compatibility break
**Compatible with:** Existing clients will need token to access API

---

### Step 4: Rollback Strategy
If issues detected:
1. Revert to previous code deployment
2. Guards no longer enforced
3. Database password column remains (safe)
4. Clients continue working without auth

**Recovery Time:** < 5 minutes (redeploy previous version)

---

## Implementation Phase Breakdown

### Phase 1: Core Authentication (This Change)
- [ ] Create auth module structure
- [ ] Implement JWT strategy
- [ ] Add password field to User entity
- [ ] Create auth endpoints (/register, /login, /refresh)
- [ ] Implement route guards
- [ ] Add integration tests

### Phase 2: Security Hardening (Future)
- [ ] Rate limiting on login attempts
- [ ] Password reset via email
- [ ] Token revocation blacklist
- [ ] Audit logging
- [ ] Session management

### Phase 3: Advanced Features (Future)
- [ ] Role-based access control (RBAC)
- [ ] Two-factor authentication (2FA)
- [ ] OAuth2 / Social login
- [ ] API key authentication
- [ ] SAML/LDAP integration

---

## Open Questions

### Q1: Should we store refresh tokens in database?
**Options:**
- Current: Stateless (no storage) - simpler but no revocation
- Alternative: Store hashed refresh tokens - enables logout on all devices

**Decision Needed:** Depends on Phase 2 requirements

---

### Q2: How long should session tokens last?
**Current:** 1 hour access, 7 days refresh

**Alternatives:**
- Mobile apps: Shorter (30 min) for security
- Desktop: Longer (24 hours) for convenience

**Decision Needed:** May need environment-based configuration

---

### Q3: Should we implement email verification?
**Current:** No email verification in Phase 1

**Alternative:** Verify email before account activation

**Decision Needed:** For Phase 2

---

### Q4: Rate limiting strategy?
**Current:** No rate limiting

**Alternatives:**
- IP-based: Limit per source IP
- User-based: Limit per email address
- Both: Combination approach

**Decision Needed:** For Phase 2 security hardening

---

### Q5: Password reset mechanism?
**Current:** No password reset

**Approaches:**
- Email link: Send reset token via email
- Security questions: Knowledge-based
- Admin override: Manual password reset

**Decision Needed:** For Phase 2

---

## Testing Strategy

### Unit Tests
- Password hashing/validation logic
- JWT claims extraction
- DTO validation
- Guard logic

### Integration Tests
- Full login flow: register → login → refresh → verify
- Protected endpoint access
- Token expiration behavior
- Invalid credentials handling

### Security Tests
- SQL injection in credentials
- XSS in responses
- Bcrypt salt randomization
- JWT signature validation

---

## Monitoring & Observability

### Metrics to Track
- Login success/failure rate
- Token refresh frequency
- Request processing time (password hashing impact)
- 401/403 error rate per endpoint

### Logging
- Login attempts (success/failure)
- Failed authentication reasons
- Token refresh events
- Guard rejections

### Alerts
- High 401 error rate (potential attack)
- Bcrypt CPU usage spike (performance monitoring)
- Configuration errors (missing JWT_SECRET)

---

## Security Checklist

- ✅ Passwords hashed with bcrypt (10+ rounds)
- ✅ JWT signed with strong secret (environment-based)
- ✅ HTTPS enforced in production (reverse proxy)
- ✅ No secrets in code
- ✅ Tokens in Authorization header (not cookies initially)
- ✅ CORS configured (specific origins)
- ✅ Input validation via DTOs
- ✅ Error messages don't leak sensitive info
- ⏳ Rate limiting (Phase 2)
- ⏳ Password reset recovery (Phase 2)

---

## Conclusion

This design provides a secure, scalable authentication foundation using industry-standard patterns. The stateless JWT approach aligns with NestJS best practices and enables easy horizontal scaling. Future phases can add token revocation, RBAC, and advanced security features without major architectural changes.
