# HardwareExpress Project Status

This document tracks the current status and architectural decisions of the HardwareExpress project.

---

## [STATUS UPDATE]
**Date:** 2026-01-11  
**Component:** Logging AI Integration  
**Change:** AI analysis payload now sends only log description text  
**Reason:** Focus model input on the log's descriptive content per logs schema  
**Impact:** AI service no longer receives structured metadata for analysis.

---

## [STATUS UPDATE]
**Date:** 2026-01-11  
**Component:** Logging AI Integration  
**Change:** Store negative-class score and derive `is_suspicious` from that threshold  
**Reason:** Prevent admin confusion when positive-class scores are high  
**Impact:** `logs_ai.score` now reflects negative likelihood; suspicion uses that score.

---

## [STATUS UPDATE]
**Date:** 2026-01-11  
**Component:** Logging AI Integration  
**Change:** Mask UUIDs in log descriptions before sending to AI service  
**Reason:** Remove identifiers and keep model input focused on content  
**Impact:** AI analysis receives `<ID>`/`<ORDER_ID>` placeholders instead of UUIDs.

---

## [STATUS UPDATE]
**Date:** 2026-01-11  
**Component:** Logging AI Integration  
**Change:** Removed `label` and `ai_summary` usage for logs_ai persistence  
**Reason:** Columns were removed from the database schema  
**Impact:** Backend no longer reads or writes those fields.

---

## [STATUS UPDATE]
**Date:** 2026-01-11  
**Component:** Admin Users + Logging  
**Change:** Added submit guard on user edits and simplified update log description  
**Reason:** Prevent double submissions and avoid listing all updated fields  
**Impact:** Admin updates are single-submit; logs show a single field or "multiple fields".

---

## [STATUS UPDATE]
**Date:** 2026-01-11  
**Component:** Admin Users Logging  
**Change:** Update-user log description now includes only email and ID  
**Reason:** Keep log descriptions concise without field listings  
**Impact:** Log entries no longer mention updated fields.

---

## [STATUS UPDATE]
**Date:** 2026-01-11  
**Component:** Admin Users UI  
**Change:** Require password input when creating a new user  
**Reason:** Users table schema requires `password_hash`, and creation must collect a password  
**Impact:** Admins now enter a password in the "Add User" dialog; updates remain unchanged.

---

## [STATUS UPDATE]
**Date:** 2026-01-05  
**Component:** Logs Admin UI + API  
**Change:** Added admin-only logs endpoint with pagination and frontend logs page  
**Reason:** Provide efficient log browsing without loading all records in a single request  
**Impact:** Admins can view audit logs per page; backend returns paginated log data.

---

## [STATUS UPDATE]
**Date:** 2026-01-05  
**Component:** Logging AI Integration  
**Change:** Python microservice hook added for log analysis and persistence to logs_ai  
**Reason:** Provide AI scoring/summary per log without mixing Python dependencies in Node  
**Impact:** Each log can trigger AI analysis and store results in logs_ai for review.

---

## [STATUS UPDATE]
**Date:** 2025-01-30  
**Component:** Backend Infrastructure  
**Change:** Phase 1 - Backend skeleton and database connection implemented  
**Reason:** Establish foundation for API server with proper architecture separation  
**Impact:** Backend server can now connect to Supabase PostgreSQL database. Ready for Phase 2 (authentication).

---

## [STATUS UPDATE]
**Date:** 2025-01-30  
**Component:** Authentication System  
**Change:** Phase 2 - Authentication endpoints implemented (JWT + bcrypt)  
**Reason:** Implement secure authentication with password hashing and JWT tokens  
**Impact:** Users can now login, logout, and verify authentication. Ready for Phase 3 (RBAC middleware).

---

## [STATUS UPDATE]
**Date:** 2025-01-30  
**Component:** RBAC Middleware  
**Change:** Phase 3 - Role-based access control middleware implemented  
**Reason:** Centralized authorization system for role-based route protection  
**Impact:** Routes can now be protected by role requirements. No inline role checks needed in controllers. Ready for Phase 4 (Domain APIs).

---

## [STATUS UPDATE]
**Date:** 2025-01-30  
**Component:** Domain API Endpoints  
**Change:** Phase 4 - All domain APIs implemented (catalog, orders, users, dashboard)  
**Reason:** Complete backend API implementation with proper RBAC, transformations, and business logic  
**Impact:** Full backend API ready for frontend integration. All endpoints follow CURSOR_RULES.md architecture. Ready for Phase 5 (Logging Service).

---

## [STATUS UPDATE]
**Date:** 2025-01-30  
**Component:** Logging Service  
**Change:** Phase 5 - Centralized logging service implemented  
**Reason:** Audit trail for all significant system actions  
**Impact:** All authentication, order, and user operations are now logged to database. Ready for Phase 6 (Frontend Integration).

---

## [STATUS UPDATE]
**Date:** 2025-01-30  
**Component:** Frontend Integration  
**Change:** Phase 6 - Frontend integrated with backend API  
**Reason:** Replace mock data with real HTTP API calls, complete full-stack integration  
**Impact:** Frontend now communicates with real backend API. All mock data removed. JWT authentication integrated. Ready for production use.

---

## Current Phase: Phase 6 Complete ✅

### Completed Components

#### Backend Structure
- ✅ Express.js server setup (`server/src/index.ts`)
- ✅ TypeScript configuration (`server/tsconfig.json`)
- ✅ Package.json with dependencies (`server/package.json`)
- ✅ Folder structure following CURSOR_RULES.md:
  - `server/src/controllers/` - Request/response handling
  - `server/src/services/` - Business logic
  - `server/src/repositories/` - Database access
  - `server/src/middlewares/` - Auth, validation, logging
  - `server/src/routes/` - Route definitions
  - `server/src/config/` - Configuration files
  - `server/src/types/` - TypeScript type definitions

#### Database Connection
- ✅ Supabase PostgreSQL client configured (`server/src/config/database.ts`)
- ✅ Database type definitions matching exact schema (`server/src/types/database.ts`)
- ✅ Health check endpoint with database connection test (`/health`)

#### Type Definitions
- ✅ Complete database type definitions matching DATABASE_SCHEMA.md:
  - `UserRow` - matches `users` table exactly
  - `CatalogItemRow` - matches `catalog_items` table exactly
  - `OrderRow` - matches `orders` table exactly
  - `OrderItemRow` - matches `order_items` table exactly
  - `LogRow` - matches `logs` table exactly
  - All ENUM types matching PostgreSQL enums
- ✅ API type definitions for request/response contracts:
  - `JWTPayload` - minimal JWT payload (user_id + role)
  - `LoginRequest`, `LoginResponse` - authentication types
  - `UserResponse` - user data (never includes password_hash)

#### Authentication System (Phase 2)
- ✅ Password hashing service using bcrypt (`server/src/services/password.service.ts`)
- ✅ JWT service for token generation/verification (`server/src/services/jwt.service.ts`)
- ✅ Authentication service with business logic (`server/src/services/auth.service.ts`)
- ✅ User repository for database access (`server/src/repositories/user.repository.ts`)
- ✅ Authentication middleware (`server/src/middlewares/auth.middleware.ts`)
- ✅ Authentication controller (`server/src/controllers/auth.controller.ts`)
- ✅ Authentication routes (`server/src/routes/auth.routes.ts`)
- ✅ Endpoints implemented:
  - `POST /api/auth/login` - Authenticate with email/password
  - `POST /api/auth/logout` - Stateless logout
  - `GET /api/auth/me` - Get current authenticated user

#### RBAC Middleware System (Phase 3)
- ✅ RBAC middleware (`server/src/middlewares/rbac.middleware.ts`)
- ✅ Centralized authorization logic
- ✅ Composable middleware functions:
  - `requireRole(role)` - Require specific role
  - `requireAnyRole(...roles)` - Require any of specified roles
  - `requireAdmin` - Admin-only convenience middleware
  - `requireManagerOrAdmin` - Manager or admin convenience middleware
  - `requireAuthenticated` - Any authenticated user
- ✅ Uses roles exactly as defined in database ENUM
- ✅ Relies solely on `req.user` from auth middleware
- ✅ No inline role checks in controllers
- ✅ Returns 403 Forbidden for unauthorized access
- ✅ Usage examples documented (`server/src/middlewares/rbac.example.ts`)

---

## Architectural Decisions

### Database Client Library

**Decision:** Using `@supabase/supabase-js` instead of `pg` (node-postgres)  
**Reason:** 
- Built-in connection pooling and retry logic
- TypeScript support out of the box
- Optimized for Supabase infrastructure
- Less boilerplate code

**Alternative:** Using `pg` (node-postgres) directly  
**Rejected:** Requires manual connection pool management, more boilerplate, and doesn't leverage Supabase-specific optimizations.

### Service Role Key Usage

**Decision:** Using Supabase service_role key instead of anon key  
**Reason:** 
- We're implementing custom authentication and authorization
- Need to bypass RLS (Row Level Security) since we handle access control in backend
- CURSOR_RULES.md explicitly states not to use Supabase Auth/RLS/Policies

**Alternative:** Using anon key with RLS policies  
**Rejected:** Violates CURSOR_RULES.md requirement to implement custom auth/RBAC. We need full control over access control.

### Type System Architecture

**Decision:** Separate database types from API response types  
**Reason:** 
- Database schema uses snake_case (`user_id`, `full_name`, `created_at`)
- Frontend expects camelCase (`id`, `name`, `createdAt`)
- Database schema is single source of truth - we adapt frontend, not database
- Transformations happen in repositories/services layer

**Alternative:** Single type for both database and API  
**Rejected:** Would require changing database schema or frontend types, violating the constraint that database schema is immutable.

### Folder Structure

**Decision:** Layered architecture (Controllers → Services → Repositories)  
**Reason:** 
- Follows CURSOR_RULES.md requirements
- Clear separation of concerns
- Easy to test and maintain
- No business logic in controllers
- No business logic in repositories

**Alternative:** Flat structure or MVC pattern  
**Rejected:** Doesn't provide clear separation between data access, business logic, and request handling as required by CURSOR_RULES.md.

### Password Hashing

**Decision:** Using bcrypt instead of PBKDF2  
**Reason:** 
- Battle-tested and widely used
- Built-in salt generation and cost factor
- Simpler API than PBKDF2
- Good balance of security and performance
- Recommended by OWASP

**Alternative:** PBKDF2  
**Rejected:** More complex API, requires manual salt management, similar security but less convenient.

### JWT Algorithm

**Decision:** Using HS256 (symmetric) instead of RS256 (asymmetric)  
**Reason:** 
- Single backend architecture, no key distribution needed
- Simpler implementation (no key pair management)
- Faster verification
- Sufficient for our use case

**Alternative:** RS256  
**Rejected:** Adds complexity suitable for microservices with key distribution. Not needed for single-backend architecture.

### JWT Payload

**Decision:** Minimal payload (user_id + role only)  
**Reason:** 
- Smaller token size
- Faster verification
- Principle of least privilege
- User details fetched from database when needed

**Alternative:** Include full user object in JWT  
**Rejected:** Larger token size, security risk if token is compromised, user data becomes stale.

### Authentication Flow

**Decision:** Stateless authentication (JWT only, no sessions)  
**Reason:** 
- Scalable, no server-side session storage needed
- Works well with load balancing
- Simpler architecture

**Alternative:** Session-based authentication  
**Rejected:** Requires session storage (Redis/DB), more complex, doesn't scale as well horizontally.

### Logout Implementation

**Decision:** Stateless logout (client removes token)  
**Reason:** 
- JWT is stateless - tokens valid until expiration
- No server-side token invalidation needed for Phase 2
- Simpler implementation

**Alternative:** Token blacklist/revocation  
**Rejected:** Requires additional storage (Redis/DB), adds complexity. Not needed for Phase 2. Can be added later if required.

### RBAC Architecture

**Decision:** Centralized middleware-based RBAC  
**Reason:** 
- Single source of truth for authorization logic
- Reusable across all routes
- No inline role checks in controllers (follows CURSOR_RULES.md)
- Easy to test and maintain
- Composable - can chain multiple role checks

**Alternative:** Inline role checks in controllers  
**Rejected:** Violates CURSOR_RULES.md requirement: "No business logic inside controllers"
              Also violates DRY principle, harder to maintain and test.

**Alternative:** Decorator pattern or class-based authorization  
**Rejected:** Over-engineered for Express.js, adds complexity without benefit.
              Middleware pattern is idiomatic Express.js and sufficient.

### RBAC Middleware Design

**Decision:** Function factory pattern for composability  
**Reason:** Allows creating reusable middleware functions for different roles.
            Can be used directly in route definitions.

**Alternative:** Single middleware with role parameter passed via closure  
**Rejected:** Less flexible, harder to compose multiple role checks.

**Decision:** Support multiple roles with "any" logic  
**Reason:** Some routes may be accessible by multiple roles (e.g., admin OR manager).
            More flexible than single role requirement.

**Alternative:** Multiple single-role middleware chained with OR logic  
**Rejected:** Express middleware doesn't support OR logic natively.
              Would require custom logic anyway, better to make it explicit.

**Decision:** Convenience functions for common patterns  
**Reason:** Improves readability and developer experience for common cases
            (admin-only, manager-or-admin, etc.)

**Alternative:** Always use generic requireRole/requireAnyRole  
**Rejected:** Less readable, more verbose. Convenience functions express intent more clearly.

### Logging Architecture

**Decision:** Centralized logging service  
**Reason:** 
- Single source of truth for logging logic
- Consistent logging format across the system
- Easy to maintain and update logging behavior
- Reusable across all controllers/services

**Alternative:** Inline logging in each controller/service  
**Rejected:** Code duplication, inconsistent logging, harder to maintain, violates DRY principle.

**Alternative:** Logging middleware that intercepts all requests  
**Rejected:** Too broad, logs everything including non-significant actions. We need selective logging for specific business events.

### Logging Implementation

**Decision:** Async logging (fire and forget)  
**Reason:** Logging shouldn't block request processing. Errors in logging shouldn't affect business logic.

**Alternative:** Synchronous logging with await  
**Rejected:** Slows down request processing, logging errors could break requests.

**Alternative:** Queue-based logging  
**Rejected:** Adds complexity, requires queue infrastructure. Fire-and-forget is sufficient for Phase 5.

### IP Address Extraction

**Decision:** Check proxy headers (X-Forwarded-For, X-Real-IP)  
**Reason:** In production, requests often go through proxies/load balancers. Real client IP is in headers.

**Alternative:** Use req.ip or req.connection.remoteAddress only  
**Rejected:** Doesn't work behind proxies, returns proxy IP instead of client IP.

### Severity Determination

**Decision:** Severity mapping based on action type and success/failure  
**Reason:** Provides meaningful severity levels for log analysis and alerting. Critical operations get higher severity.

**Alternative:** All logs have same severity  
**Rejected:** Makes log analysis harder, can't prioritize important events.

**Alternative:** Configurable severity mapping  
**Rejected:** Adds complexity, hardcoded mapping is sufficient for Phase 5.

---

## Data Mapping Strategy

### User Model Mapping
- Database: `user_id` → API: `id`
- Database: `full_name` → API: `name`
- Database: `created_at` → API: `createdAt`
- Database: `password_hash` → **NEVER exposed** to client

### Equipment Model Mapping
- Database: `item_id` → API: `id`
- Database: `item_name` → API: `name`
- Database: `price` (integer cents) → API: `unitPrice` (number dollars)
- Database: `specification` (singular) → API: `specifications` (plural)
- Database: `quantity` → API: `stockQuantity`
- Database: `in_stock` → API: `inStock`

### Order Model Mapping
- Database: `order_id` → API: `id`
- Database: `user_id` → API: `userId`
- Database: `total_price` (integer cents) → API: `totalAmount` (number dollars)
- Database: `justify_msg` → API: `justification`
- Database: `created_at` → API: `createdAt`
- Database: `status` enum values need mapping (see Order Status Mapping below)

### Order Status Mapping
**Database Enum:** `pending`, `approved`, `rejected`, `completed`  
**Frontend Type:** `pending`, `approved`, `rejected`, `ordered`, `delivered`

**Decision:** Map `ordered` and `delivered` to `completed`  
**Reason:** Database enum doesn't include these statuses. We'll map them during transformation.  
**Alternative:** Add statuses to database enum  
**Rejected:** Database schema is immutable. We adapt frontend to database, not vice versa.

---

## Next Steps

### Phase 2: Authentication ✅ Complete
- [x] JWT token generation and validation
- [x] Password hashing with bcrypt
- [x] Login endpoint (`POST /api/auth/login`)
- [x] Logout endpoint (`POST /api/auth/logout`)
- [x] Get current user endpoint (`GET /api/auth/me`)

### Phase 3: RBAC Middleware ✅ Complete
- [x] Role-based access control middleware
- [x] Route protection based on user roles
- [x] Admin-only routes (requireAdmin)
- [x] Manager-only routes (requireManagerOrAdmin)
- [x] Composable middleware functions
- [x] Uses database ENUM roles exactly
- [x] No inline role checks in controllers

### Phase 4: API Endpoints ✅ Complete
- [x] Catalog/Equipment endpoints (`GET /api/equipment`, `GET /api/equipment/:itemId`, `GET /api/equipment/categories`)
- [x] Orders endpoints (`GET /api/orders`, `GET /api/orders/:orderId`, `POST /api/orders`, `PATCH /api/orders/:orderId/status`)
- [x] Users CRUD (admin only) (`GET /api/users`, `GET /api/users/:userId`, `POST /api/users`, `PATCH /api/users/:userId`, `DELETE /api/users/:userId`)
- [x] Dashboard endpoints (`GET /api/dashboard/stats`, `GET /api/dashboard/recent-orders`)

### Phase 5: Logging Service ✅ Complete
- [x] Centralized logging service (`server/src/services/logging.service.ts`)
- [x] Log repository (`server/src/repositories/log.repository.ts`)
- [x] Authentication event logging (login success/failure, logout)
- [x] Order event logging (create, status updates)
- [x] User CRUD event logging (create, update, delete)
- [x] IP address extraction from requests
- [x] Severity level determination
- [x] Logs persisted to `logs` table
- [x] Helper functions for common logging patterns

### Phase 6: Frontend Integration ✅ Complete
- [x] Removed all mock.ts usage
- [x] Replaced mock API calls with real HTTP requests
- [x] Created API client with JWT token management
- [x] Updated frontend types to match backend API responses
- [x] Integrated JWT authentication (login, logout, token storage)
- [x] Updated AuthContext to handle tokens and restore sessions
- [x] Updated all pages to use real API (Equipment, Orders, Users, Dashboard)
- [x] Explicit enum mismatch handling (OrderStatus mapping)
- [x] Error handling in all API calls
- [x] Nullable department field handling

---

## Excluded Technologies

As per CURSOR_RULES.md:
- ❌ Supabase Auth (using custom JWT)
- ❌ Supabase RLS (handling in backend)
- ❌ Supabase Policies (handling in backend)
- ❌ Supabase Edge Functions (using Express.js)

---

## Environment Setup

See `server/ENV_SETUP.md` for environment variable configuration.

---

**Last Updated:** 2025-01-30  
**Current Phase:** Phase 6 Complete ✅  
**Next Phase:** Production Ready - All phases complete

