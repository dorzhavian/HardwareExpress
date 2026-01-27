/**
 * Route definitions for authentication endpoints.
 */

import { Router } from 'express';
import { loginController } from '../controllers/auth.controller.js';

const router = Router();

/**
 * POST /login
 */
router.post('/login', loginController);

export default router;
