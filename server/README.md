# HardwareExpress Backend

Backend API server for the HardwareExpress equipment ordering system.

## Architecture

Following CURSOR_RULES.md, the backend follows strict separation of concerns:

- **Controllers**: Request/response handling only
- **Services**: Business logic and transformations
- **Repositories**: Database access only
- **Middlewares**: Authentication, authorization, validation, logging

---

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Create Environment File

Create a `.env` file in the `server/` directory:

```env
# ===========================================
# Supabase Database Configuration
# ===========================================
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ===========================================
# Server Configuration
# ===========================================
PORT=3000
NODE_ENV=development

# ===========================================
# JWT Configuration
# ===========================================
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1h

# ===========================================
# AI Service Configuration (Node -> Python)
# ===========================================
AI_SERVICE_URL=http://127.0.0.1:8001
AI_SERVICE_TIMEOUT_MS=60000

# ===========================================
# AI Microservice Configuration (Python)
# ===========================================
AI_SERVICE_HOST=127.0.0.1
AI_SERVICE_PORT=8001
```

### Getting Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings → API**
4. Copy the values:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ **Important**: Use the `service_role` key, NOT the `anon` key. The service role key bypasses Row Level Security (RLS) which is required for backend operations.

### JWT Secret Generation

Generate a secure JWT secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use any random string generator (minimum 32 characters)
```