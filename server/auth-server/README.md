# HardwareExpress Authentication Server

Dedicated authentication server for HardwareExpress system. Handles user login, password verification, and JWT token generation.

## Setup

### 1. Install Dependencies

```bash
cd server/auth-server
npm install
```

### 2. Create Environment File

Create a `.env` file in the `server/auth-server/` directory:

```env
# ===========================================
# Supabase Database Configuration
# ===========================================
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ===========================================
# Server Configuration
# ===========================================
PORT=3001
NODE_ENV=development

# ===========================================
# JWT Configuration
# ===========================================
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1h
```

**Important**: The `JWT_SECRET` must be **identical** to the one used in the Backend API server (`server/.env`). Both servers need the same secret to generate and verify tokens.

### Getting Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings → API**
4. Copy the values:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

**Important**: Use the `service_role` key, NOT the `anon` key. The service role key bypasses Row Level Security (RLS) which is required for backend operations.

