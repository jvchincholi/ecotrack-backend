# EcoTrack Backend - Claude AI Context

## Project Overview
**EcoTrack Backend** is a NestJS REST API that powers the personal carbon footprint tracking application. It handles user authentication, activity logging, CO2 calculations, analytics, and personalized recommendations.

## Technology Stack
- **Framework:** NestJS 10+
- **Language:** TypeScript 5+
- **Database:** PostgreSQL 16
- **ORM:** TypeORM
- **Authentication:** JWT + Passport
- **Testing:** Jest
- **API Documentation:** Swagger/OpenAPI

## Project Structure
```
src/
├── auth/                    # Authentication module
├── users/                   # User management
├── activities/              # Activity tracking
├── emissions/               # Emission factors & calculations
├── analytics/               # Dashboard & reporting
├── recommendations/         # Recommendation engine
├── common/                  # Shared utilities, guards, pipes
├── database/                # Database configuration
└── main.ts                  # Application bootstrap
```

## Domain Model (Key Entities)
1. **User** - Registered users with authentication
2. **Activity** - Logged daily activities with CO2 calculations
3. **ActivityCategory** - Categories: Transportation, Food, Energy, Shopping, Waste
4. **CO2EmissionFactor** - Reference data for CO2 calculations
5. **DailyStats** - Aggregated daily statistics
6. **Goal** - User carbon reduction goals
7. **Recommendation** - Personalized carbon reduction suggestions

## API Endpoints (Key Routes)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Activities
- `POST /api/activities` - Log new activity
- `GET /api/activities` - List user activities with pagination
- `GET /api/activities/:id` - Get specific activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### Emissions
- `GET /api/emissions/categories` - List activity categories
- `GET /api/emissions/factors` - List emission factors

### Analytics
- `GET /api/analytics/dashboard` - Dashboard summary
- `GET /api/analytics/timeseries` - Time series data
- `GET /api/analytics/categories` - Category breakdown

### Recommendations
- `GET /api/recommendations` - List recommendations
- `POST /api/recommendations/:id/read` - Mark as read
- `POST /api/recommendations/:id/dismiss` - Dismiss recommendation

## Key Features
- ✅ Secure JWT authentication with httpOnly cookies
- ✅ TypeORM for database abstraction
- ✅ Automatic CO2 calculation engine
- ✅ Real-time analytics aggregation
- ✅ Input validation with class-validator
- ✅ Swagger/OpenAPI documentation
- ✅ Global error handling
- ✅ Rate limiting on sensitive endpoints

## Development Workflow
1. **Specification First:** OpenAPI spec drives implementation
2. **TDD:** Write tests before implementation
3. **Module Structure:** Each domain has its own module
4. **Dependency Injection:** NestJS DI container
5. **Environmental Separation:** Dev, test, production configs

## Database Setup
```bash
# Create database
psql -U postgres
CREATE DATABASE ecotrack_db;
CREATE USER ecotrack_user WITH PASSWORD 'ecotrack_dev_2026';
GRANT ALL PRIVILEGES ON DATABASE ecotrack_db TO ecotrack_user;

# Run migrations
pnpm run migration:run

# Seed data
pnpm run seed
```

## Environment Variables
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=ecotrack_user
DATABASE_PASSWORD=ecotrack_dev_2026
DATABASE_NAME=ecotrack_db

JWT_SECRET=ecotrack-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Code Guidelines
- Use TypeScript strict mode
- Follow NestJS best practices
- Implement guards and pipes for cross-cutting concerns
- DTOs for all API inputs
- Entities for database models
- Services for business logic
- Controllers for API routes
- Unit test coverage > 70%

## Common Commands
```bash
pnpm install              # Install dependencies
pnpm run start:dev        # Start dev server with hot reload
pnpm run build            # Build for production
pnpm run start            # Run production build
pnpm run test             # Run unit tests
pnpm run test:e2e         # Run integration tests
pnpm run lint             # Run ESLint
pnpm run format           # Format with Prettier
```

## Important Notes
- Database transactions for critical operations
- Always validate user ownership of resources
- Rate limit auth endpoints
- Log all errors for debugging
- Use DTOs for API contracts
- Never commit `.env` files
- Maintain API backward compatibility

## Related Files
- `openspec.yaml` - OpenSpec configuration
- `.github/workflows/backend-ci.yml` - CI/CD pipeline
- Documentation: See root `/docs` folder
