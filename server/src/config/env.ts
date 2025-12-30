/**
 * Environment Variables Loader
 * 
 * This file must be imported FIRST before any other imports that depend on env variables.
 * It loads environment variables from .env file using dotenv.
 * 
 * Decision: Separate env.ts file instead of --require flag
 * Reason: tsx watch doesn't support --require in the same way as node.
 *         This approach works reliably with tsx watch and in production.
 * 
 * Alternative: Using --require dotenv/config
 * Rejected: Doesn't work with tsx watch command properly.
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

