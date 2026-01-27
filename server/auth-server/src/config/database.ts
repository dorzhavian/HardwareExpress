/**
 * Database Configuration
 * 
 * Supabase PostgreSQL connection setup.
 * Uses Supabase client library for direct PostgreSQL access.
 * 
 * Decision: Using @supabase/supabase-js instead of pg (node-postgres)
 * Reason: Supabase client provides built-in connection pooling, retry logic,
 *         and TypeScript support. Since we're using Supabase as the database
 *         host, their client library is optimized for this use case.
 * 
 * Alternative: Using pg (node-postgres) directly
 * Rejected: Requires manual connection pool management, more boilerplate code,
 *           and doesn't leverage Supabase-specific optimizations.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
  );
}

/**
 * Supabase client configured with service role key.
 * Service role key bypasses RLS (Row Level Security) since we're implementing
 * our own authentication and authorization in the backend.
 * 
 * Decision: Using service role key instead of anon key
 * Reason: We're implementing custom auth/RBAC, so we need full database access
 *         without RLS restrictions. All security is handled in our backend code.
 * 
 * Alternative: Using anon key with RLS policies
 * Rejected: CURSOR_RULES.md explicitly states not to use Supabase Auth/RLS/Policies.
 *           We need full control over access control in our backend.
 */
export const database = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
