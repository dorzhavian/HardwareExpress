/**
 * Catalog Routes
 * 
 * Route definitions for catalog/equipment endpoints.
 * 
 * Decision: Public routes (no authentication required)
 * Reason: Equipment catalog should be accessible to all users.
 *         Authentication happens when creating orders.
 * 
 * Alternative: Require authentication for catalog access
 * Rejected: Unnecessary restriction - catalog browsing doesn't need auth.
 *           Only order creation needs authentication.
 */

import { Router } from 'express';
import {
  getAllEquipmentController,
  getEquipmentByIdController,
  getCategoriesController,
} from '../controllers/catalog.controller.js';

const router = Router();

/**
 * GET /api/equipment
 * Get all equipment items
 * Query params: category (optional), search (optional)
 */
router.get('/', getAllEquipmentController);

/**
 * GET /api/equipment/categories
 * Get list of available categories
 */
router.get('/categories', getCategoriesController);

/**
 * GET /api/equipment/:itemId
 * Get equipment item by ID
 */
router.get('/:itemId', getEquipmentByIdController);

export default router;

