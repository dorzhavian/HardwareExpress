/**
 * HardwareExpress Backend Server
 * 
 * Entry point for the Express.js API server.
 * Phase 4: Domain API endpoints implemented.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { database } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    // Test database connection by querying a simple table
    // Using users table as it's guaranteed to exist per schema
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

    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API routes
app.get('/api', (_req, res) => {
  res.json({
    message: 'HardwareExpress API',
    version: '1.0.0',
    phase: 4,
    status: 'Domain APIs implemented',
  });
});

// Domain API routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', catalogRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

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
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/health`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
});

