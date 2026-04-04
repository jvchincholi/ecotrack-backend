# PostgreSQL Local Setup Guide

## Quick Start

### 1. Install PostgreSQL (macOS)

```bash
# Using Homebrew
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Verify installation
psql --version
# Expected: psql (PostgreSQL) 16.x.x
```

### 2. Create Database and User

```bash
# Connect to PostgreSQL as default user
psql -U postgres

# Inside psql prompt:
CREATE DATABASE ecotrack_db;
CREATE USER ecotrack_user WITH PASSWORD 'ecotrack_dev_2026';
GRANT ALL PRIVILEGES ON DATABASE ecotrack_db TO ecotrack_user;

# Verify (exit first with \q)
psql -U ecotrack_user -d ecotrack_db -c "SELECT 1;"
# Should return: 1
```

### 3. Run Database Migrations

```bash
cd /Users/jayanthchincholi/Documents/mywork/personal/ecotrack-backend

# Build project
pnpm run build

# Run migrations
pnpm run migration:run

# You should see:
# query: CREATE TABLE "users" ...
# query: CREATE TABLE "emission_factors" ...
# ...
# ✓ executed successfully
```

### 4. Start Development Server

```bash
# Terminal 1: Start dev server
pnpm run start:dev

# Should see:
# [NestFactory] No entry file specified...
# [NestFactory] NestJs 10.4.22 application successfully started
# [InstanceLoader] AppModule dependencies initialized
# [InstanceLoader] DatabaseModule dependencies initialized
# [InstanceLoader] AuthModule dependencies initialized
# [Nest] 2626 4 Apr 21:40:11 - info     [NestFactory] Nest application successfully started
```

### 5. Test Endpoints (Terminal 2)

```bash
# Test 1: Health check (public endpoint)
curl http://localhost:3001/

# Expected: "Hello World!"

# Test 2: Register new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Expected: 201 Created with tokens and user data

# Test 3: Try accessing protected endpoint without token
curl http://localhost:3001/api/auth/me

# Expected: 401 Unauthorized

# Test 4: Access with token from registration
# Copy the accessToken from Test 2 response
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"

# Expected: 200 OK with user profile
```

## Troubleshooting

### PostgreSQL Service Issues

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start service
brew services start postgresql@16

# Stop service
brew services stop postgresql@16

# Restart service
brew services restart postgresql@16
```

### Database Connection Issues

```bash
# Test psql connection
psql -h localhost -U ecotrack_user -d ecotrack_db -c "SELECT NOW();"

# Should return current timestamp

# If connection refused:
# - Verify PostgreSQL is running: brew services list
# - Verify port 5432: lsof -i :5432
# - Check credentials match .env file
```

### Migration Issues

```bash
# Clear and restart migrations (WARNING: Deletes data)
psql -U ecotrack_user -d ecotrack_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then re-run migrations
pnpm run migration:run
```

### Password Hashing Issues

```bash
# Test bcrypt hashing via TypeScript
node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('TestPassword123', 10).then(hash => console.log(hash));
"

# Should output a bcrypt hash starting with $2a$ or $2b$
```

## Database Schema Verification

After migrations run, verify tables:

```bash
psql -U ecotrack_user -d ecotrack_db

# Inside psql:

# List tables
\dt

# View users table structure
\d users

# Should show:
# - id (uuid, primary key)
# - email (varchar, unique)
# - password (varchar)
# - firstName (varchar)
# - lastName (varchar)
# - avatar (varchar, nullable)
# - lastLoginAt (timestamp, nullable)
# - createdAt (timestamp)
# - updatedAt (timestamp)

# View constraints
\d+ users

# Should show:
# - UNIQUE constraint on email
# - CHECK constraint on password length
```

## Integration Testing Commands

```bash
# In project root:

# Run all tests
pnpm run test

# Run tests in watch mode (auto-rerun on file changes)
pnpm run test:watch

# Run with coverage
pnpm run test:cov

# Run end-to-end tests
pnpm run test:e2e

# Run specific test file
pnpm run test -- auth.service.spec
```

## Manual API Testing with curl

### Complete Auth Flow

```bash
# 1. Register
REGISTER=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123",
    "firstName": "Alice",
    "lastName": "Smith"
  }')

echo "Register Response: $REGISTER"

# Extract tokens from response (requires jq)
ACCESS_TOKEN=$(echo $REGISTER | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $REGISTER | jq -r '.refreshToken')

echo "Access Token: $ACCESS_TOKEN"
echo "Refresh Token: $REFRESH_TOKEN"

# 2. Get profile with access token
curl -s -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .

# 3. Refresh access token
NEW_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" | jq -r '.accessToken')

echo "New Access Token: $NEW_TOKEN"

# 4. Login with same credentials
LOGIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123"
  }')

echo "Login Response: $LOGIN"

# 5. Test invalid credentials
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "WrongPassword"
  }' | jq .

# Expected: 401 Unauthorized
```

## Performance Testing

```bash
# Load testing (requires Apache Bench)
# Install: brew install httpd

# Test register endpoint
ab -n 100 -c 10 -p data.json \
  -T application/json \
  http://localhost:3001/api/auth/register

# Results will show:
# - Requests per second
# - Average response time
# - Min/Max response times
```

## Debugging

### Enable Request Logging

Add to `src/main.ts`:
```typescript
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}
```

### Check Database Queries

TypeORM logging in `.env`:
```
DB_LOGGING=true
```

### View Server Logs

```bash
# While dev server running:
# - TypeScript compilation logs
# - Database connection logs
# - Request/response logs
# - Error traces
```

## Verification Checklist

After setup:
- [ ] PostgreSQL running (`brew services list` shows running)
- [ ] Database created (`psql -U ecotrack_user -d ecotrack_db -c "SELECT 1;"` returns 1)
- [ ] User table has password field (`\d users` shows password column)
- [ ] Server starts (`pnpm run start:dev` no errors)
- [ ] Health endpoint works (curl returns "Hello World!")
- [ ] Can register user (POST /api/auth/register works, returns tokens)
- [ ] Can login (POST /api/auth/login works with valid credentials)
- [ ] Token refresh works (POST /api/auth/refresh returns new token)
- [ ] Protected route requires token (GET /api/auth/me without token returns 401)
- [ ] Protected route works with token (GET /api/auth/me with token returns user)

## Next Steps

1. Follow setup steps above
2. Verify database connection
3. Run migrations
4. Start dev server
5. Test all endpoints
6. Run integration tests
7. Review test output
8. Archive change when all tests pass
