# HardwareExpress Backend

Backend API server for HardwareExpress equipment ordering system.

## Architecture

Following CURSOR_RULES.md, the backend follows strict separation of concerns:

- **Controllers**: Request/response handling only
- **Services**: Business logic and transformations
- **Repositories**: Database access only
- **Middlewares**: Authentication, authorization, validation, logging

## Phase 1 Status

✅ Backend project skeleton created  
✅ Express.js server setup  
✅ Supabase PostgreSQL connection configured  
✅ TypeScript configuration  
✅ Database type definitions matching exact schema  

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. Run development server:
```bash
npm run dev
```

4. Check health endpoint:
```bash
curl http://localhost:3000/health
```

## Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (bypasses RLS)
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Database Connection

The backend uses `@supabase/supabase-js` client library for PostgreSQL access.

**Decision**: Using Supabase client instead of raw `pg` library  
**Reason**: Built-in connection pooling, retry logic, TypeScript support  
**Alternative**: `pg` (node-postgres) - rejected due to more boilerplate

## Next Phases

- Phase 2: Authentication (JWT + password hashing)
- Phase 3: RBAC Middleware
- Phase 4: API Endpoints Implementation
- Phase 5: Logging Service
- Phase 6: Frontend Integration




