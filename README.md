# 🌍 EcoTrack Backend API

NestJS backend for the personal carbon footprint tracking application. RESTful API that handles user authentication, activity logging, CO2 calculations, analytics, and personalized recommendations.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- PostgreSQL 16+

### Installation

```bash
# Clone repository
git clone https://github.com/jvchincholi/ecotrack-backend.git
cd ecotrack-backend

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Start PostgreSQL and create database
psql -U postgres
CREATE DATABASE ecotrack_db;
CREATE USER ecotrack_user WITH PASSWORD 'ecotrack_dev_2026';
GRANT ALL PRIVILEGES ON DATABASE ecotrack_db TO ecotrack_user;
\q

# Run migrations
pnpm run migration:run

# Seed data
pnpm run seed

# Start development server
pnpm run start:dev
```

### Access
- **API:** http://localhost:3001
- **Swagger Docs:** http://localhost:3001/api-docs

## 📁 Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── guards/
│       └── jwt-auth.guard.ts
│
├── users/                   # User management module
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── entities/
│   │   └── user.entity.ts
│   └── dto/
│       ├── create-user.dto.ts
│       └── user-response.dto.ts
│
├── activities/              # Activity logging module
│   ├── activities.module.ts
│   ├── activities.controller.ts
│   ├── activities.service.ts
│   ├── entities/
│   │   └── activity.entity.ts
│   └── dto/
│       └── create-activity.dto.ts
│
├── emissions/               # Emission factors module
│   ├── emissions.module.ts
│   ├── emissions.service.ts
│   └── entities/
│       └── emission-factor.entity.ts
│
├── analytics/               # Analytics module
│   ├── analytics.module.ts
│   ├── analytics.controller.ts
│   └── analytics.service.ts
│
├── recommendations/         # Recommendations module
│   ├── recommendations.module.ts
│   ├── recommendations.controller.ts
│   └── recommendations.service.ts
│
├── common/                  # Shared utilities
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   └── pipes/
│
├── database/                # Database configuration
│   ├── database.module.ts
│   └── migrations/
│
└── main.ts                  # Application bootstrap
```

## 🔌 API Endpoints

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
```

### Activities
```http
POST /api/activities
GET /api/activities?page=1&limit=20
GET /api/activities/:id
PUT /api/activities/:id
DELETE /api/activities/:id
```

### Emissions
```http
GET /api/emissions/categories
GET /api/emissions/factors?categoryId=1
```

### Analytics
```http
GET /api/analytics/dashboard
GET /api/analytics/timeseries?dateFrom=2026-04-01&dateTo=2026-04-04
GET /api/analytics/categories?dateFrom=2026-04-01
```

### Recommendations
```http
GET /api/recommendations
POST /api/recommendations/:id/read
POST /api/recommendations/:id/dismiss
```

## 🔧 Environment Variables

Create `.env` file:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=ecotrack_user
DATABASE_PASSWORD=ecotrack_dev_2026
DATABASE_NAME=ecotrack_db

# JWT Authentication
JWT_SECRET=ecotrack-super-secret-jwt-key-change-in-production-123456789
JWT_EXPIRES_IN=7d

# Application
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## 📦 Available Scripts

```bash
# Development
pnpm run start:dev         # Start with hot reload
pnpm run build             # Production build
pnpm run start             # Run production build

# Database
pnpm run migration:run     # Run migrations
pnpm run migration:create  # Create new migration
pnpm run seed              # Seed reference data

# Testing
pnpm run test              # Unit tests
pnpm run test:cov          # With coverage
pnpm run test:e2e          # Integration tests

# Code Quality
pnpm run lint              # ESLint
pnpm run format            # Prettier
pnpm run format:check      # Check formatting
```

## 🧪 Testing

```bash
# Run all tests
pnpm run test

# Watch mode
pnpm run test:watch

# Coverage report
pnpm run test:cov

# Integration tests
pnpm run test:e2e
```

## 📚 Documentation

- **API Docs:** http://localhost:3001/api-docs (Swagger UI)
- **Business Requirements:** See `/docs` folder in root repository
- **Architecture:** See `04-System-Design.md` in root
- **Domain Model:** See `03-Domain-Model.md` in root

## 🔒 Security

- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ CORS protection
- ✅ Rate limiting
- ✅ SQL injection prevention (TypeORM)
- ✅ Input validation with class-validator
- ✅ HTTPS ready for production

## 🚢 Deployment

### Prerequisites for Production
1. Set strong JWT_SECRET
2. Configure production database
3. Enable HTTPS
4. Setup environment variables
5. Configure CORS for frontend domain
6. Enable rate limiting
7. Setup logging and monitoring

### Deployment Options
- **Railway.app** - Simple Node.js hosting
- **Render.com** - Alternative hosting
- **Heroku** - Traditional deployment
- **AWS/Azure** - Enterprise solutions

## 📝 Database Schema

Key entities:
- **User** - User accounts and authentication
- **Activity** - Logged daily activities
- **ActivityCategory** - Activity classifications
- **CO2EmissionFactor** - Reference data for calculations
- **DailyStats** - Aggregated daily statistics
- **Goal** - User carbon reduction goals
- **Recommendation** - Personalized suggestions

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test
3. Commit: `git commit -m "feat: description"`
4. Push and create Pull Request

## 📄 License

[Add your license here]

## 📧 Support

For questions or issues, please open a GitHub issue.

---

**API Version:** 1.0.0  
**Last Updated:** April 4, 2026
