# 📚 Prompts & Conversations Archive

**Project:** EcoTrack Backend API  
**Date:** April 4, 2026  
**Framework:** NestJS + TypeORM + PostgreSQL  
**Methodology:** Specification-Driven Development (OpenSpec)

---

## 📑 File Index

### Overview & Quick Start
| File | Purpose |
|------|---------|
| 📖 **README.md** | This index file |
| ⚡ **QUICK-REFERENCE.md** | Fast lookup guide (start here!) |
| 📋 **01-WORKFLOW-OVERVIEW.md** | OpenSpec workflow explanation |
| 📝 **SESSION-LOG.md** | Complete session notes and decisions |

### Change Documents
| File | Purpose |
|------|---------|
| 📄 **02-PROPOSAL.md** | Backend Module 2 proposal (WHY, WHAT, Capabilities) |
| 🗂️ **specs/** | 6 specification files for authentication |

### Configuration
| File | Purpose |
|------|---------|
| ⚙️ **openspec.yaml** | Main OpenSpec configuration |

---

## 🎯 Recommended Reading Order

### First Time? Start Here:
1. **QUICK-REFERENCE.md** (5 min) - Overview of what's been done
2. **01-WORKFLOW-OVERVIEW.md** (10 min) - Understand the OpenSpec workflow
3. **02-PROPOSAL.md** (5 min) - What Module 2 is about

### For Implementation:
1. **specs/user-auth.md** - User registration & login requirements
2. **specs/jwt-strategy.md** - JWT token configuration  
3. **specs/password-security.md** - Password handling requirements
4. **specs/auth-guards.md** - Route protection requirements
5. **specs/auth-endpoints.md** - API endpoint definitions
6. **specs/user-entity.md** - User table modifications

### For Full Context:
- **SESSION-LOG.md** - Everything that happened in this session

---

## 📂 Folder Structure

```
/prompts/                              ← You are here
├── README.md                          ← This file
├── QUICK-REFERENCE.md                 ← Start here!
├── 01-WORKFLOW-OVERVIEW.md            
├── 02-PROPOSAL.md                     
├── SESSION-LOG.md                     
├── openspec.yaml                      
└── specs/                             
    ├── user-auth.md                   
    ├── jwt-strategy.md                
    ├── password-security.md           
    ├── auth-guards.md                 
    ├── auth-endpoints.md              
    └── user-entity.md                 
```

---

## 📊 What's Inside

### Module 1: Database & Entities ✅
- **Status:** Complete
- **Includes:** NestJS setup, TypeORM, PostgreSQL, 3 entities, migrations
- **Files:** In `src/` directory

### Module 2: Authentication (Specification Phase) ✅
- **Status:** Proposal & Specs Complete, Design Pending
- **Includes:** 6 detailed specifications with requirements and scenarios
- **Files:** `/specs/` folder

---

## 🔄 OpenSpec Workflow Status

```
✅ Change Created
   └─ backend-module-2-authentication

✅ Artifact: Proposal
   └─ 02-PROPOSAL.md

✅ Artifact: Specifications  
   ├─ specs/user-auth.md
   ├─ specs/jwt-strategy.md
   ├─ specs/password-security.md
   ├─ specs/auth-guards.md
   ├─ specs/auth-endpoints.md
   └─ specs/user-entity.md

⏳ Artifact: Design
   └─ Needs to be created next

⏳ Artifact: Tasks
   └─ Depends on Design

⏳ Artifact: Implementation
   └─ For writing actual code

⏳ Artifact: Verification
   └─ For testing against specs

⏳ Artifact: Archive
   └─ To finalize change
```

---

## 🚀 Next Steps

### Step 1: Create Design Document
```bash
openspec instructions design --change backend-module-2-authentication
```
Then create `design.md` with:
- Architecture and module structure
- JWT configuration approach
- Password hashing implementation
- API response format
- Database migration strategy

### Step 2: Generate Implementation Tasks
```bash
openspec instructions tasks --change backend-module-2-authentication
```
This will break work into trackable checkboxes.

### Step 3: Follow Task Checklist
Implement code while referencing specifications for validation.

### Step 4: Verify Implementation
Test each scenario from the specifications.

### Step 5: Archive Change
```bash
openspec archive backend-module-2-authentication
```
This will merge specs into main specs and complete Module 2.

---

## 🎓 Learning OpenSpec

### Concepts
- **Proposal** - WHY is this needed? WHAT will change? Which capabilities?
- **Specifications** - Detailed REQUIREMENTS and SCENARIOS (test cases)
- **Design** - HOW will we build it? Architecture and approach
- **Tasks** - Actionable work items with checkboxes
- **Implementation** - Write the actual code
- **Verification** - Validate it matches specs
- **Archive** - Finalize and merge specs

### Useful Commands
```bash
# View status
openspec status --change backend-module-2-authentication

# Get next artifact instructions
openspec instructions design --change backend-module-2-authentication

# Validate the change
openspec validate backend-module-2-authentication

# View current change
openspec show backend-module-2-authentication

# Interactive dashboard
openspec view
```

---

## 🔐 Authentication Module Summary

### What's Being Built
JWT-based authentication for protecting user data with:
- Secure password hashing (bcrypt)
- Stateless token verification (JWT)
- Route protection (guards)
- User registration and login endpoints
- Token refresh capability

### Key Requirements
- ✅ Users can register with email/password
- ✅ Passwords hashed with bcrypt (10+ rounds)
- ✅ Login returns JWT tokens
- ✅ Tokens expire in 1 hour
- ✅ Refresh tokens available for renewal
- ✅ All routes protected by default
- ✅ Bearer token authentication
- ✅ User context injection in handlers

### Endpoints Specified
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate
- `POST /api/auth/refresh` - Renew tokens
- `GET /api/auth/me` - Current user

---

## 💡 Key Decisions

| Decision | Rationale |
|----------|-----------|
| **JWT over Sessions** | Stateless, scalable, microservice-friendly |
| **Bcrypt Password Hashing** | Industry standard security, computationally expensive |
| **1-hour Token Expiry** | Balance security and user experience |
| **Guards by Default** | Fail-secure approach |
| **Passport.js** | Standard NestJS integration |
| **Separate Auth Module** | Modularity and testability |

---

## 🔧 Technical Stack

```
Framework:     NestJS v10.4.22
Database:      PostgreSQL 16  
ORM:           TypeORM v0.3.28
Auth:          Passport.js
Password:      Bcrypt
Language:      TypeScript v5.9.3
Package Mgr:   pnpm v10.29.3
OpenSpec:      v1.1.1
```

---

## 📞 Need Help?

- **Understanding specs?** → Read the specific `/specs/*.md` file
- **Workflow unclear?** → Check `01-WORKFLOW-OVERVIEW.md`
- **Lost track of changes?** → See `SESSION-LOG.md`
- **Quick lookup?** → Use `QUICK-REFERENCE.md`
- **Full context needed?** → Read this entire folder

---

## 📌 Important Files in Main Project

| Location | Purpose |
|----------|---------|
| `/openspec/` | OpenSpec workflow directory |
| `/openspec/changes/backend-module-2-authentication/` | Current change |
| `/src/` | Source code (Module 1 complete) |
| `/src/database/` | Database configuration & migrations |
| `/src/users/` | User entity (to be extended) |
| `/openspec.yaml` | Main project spec |
| `package.json` | Dependencies |
| `.env.example` | Environment template |

---

## 🎯 Success Criteria

✅ **Module 1:** Database setup, entities, migrations → **Complete**  
✅ **Module 2 - Proposal:** Clearly defined scope → **Complete**  
✅ **Module 2 - Specifications:** All requirements documented → **Complete**  
⏳ **Module 2 - Design:** Architecture planned → **Next**  
⏳ **Module 2 - Implementation:** Code written → **Later**  
⏳ **Module 2 - Verification:** Tests passing → **Later**  
⏳ **Module 2 - Complete:** Change archived → **Final**

---

**Last Updated:** April 4, 2026  
**Methodology:** Specification-Driven Development (SDD)  
**Status:** On Track for Module 2 design phase
