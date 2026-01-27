/**
 * HardwareExpress Authentication Server
 * 
 * Dedicated authentication server that handles user login and JWT token generation.
 * Separated from Backend API for improved security and architecture.
 * 
 * Decision: Separate Authentication Server
 * Reason: 
 * - Separation of concerns: Auth Server handles passwords, Backend API handles business logic
 * - Improved security: Backend API doesn't need access to password hashes
 * - Better architecture: Follows microservices pattern for authentication
 * 
 * Alternative: Single monolithic server
 * Rejected: Assignment requirements specify separate Authentication Server and Backend API.
 *           This separation improves security by isolating password handling.
 * 
 * Architecture:
 * - Auth Server (this): Handles login, password verification, JWT generation (port 3001)
 * - Backend API: Handles JWT verification and all business logic (port 3000)
 * 
 * Note: Auth Server uses shared logging service from Backend API (../../src/services/logging.service.js)
 *       to ensure all logs go through AI analysis.
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import './config/env.js';

import express from 'express';
import cors from 'cors';
import { database } from './config/database.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    // Test database connection by querying users table
    const { error } = await database
      .from('users')
      .select('user_id')
      .limit(1);
    
    if (error) {
      return res.status(503).json({
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
      });
    }

    return res.json({
      status: 'healthy',
      database: 'connected',
      service: 'authentication-server',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Authentication routes
app.use('/', authRoutes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Authentication Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Login endpoint: http://localhost:${PORT}/login`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
