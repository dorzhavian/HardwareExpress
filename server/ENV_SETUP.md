# Environment Variables Setup

Create a `.env` file in the `server/` directory with the following variables:

```env
# Supabase Database Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration (Required for Phase 2+)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
```

## Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the "Project URL" → `SUPABASE_URL`
4. Copy the "service_role" key (not the anon key) → `SUPABASE_SERVICE_ROLE_KEY`

**Important**: Use the service_role key, not the anon key, because we're implementing custom authentication and need to bypass RLS.

