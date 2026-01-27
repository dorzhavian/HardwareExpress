/**
 * Route definitions for catalog/equipment endpoints.
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
 */
router.get('/', getAllEquipmentController);

/**
 * GET /api/equipment/categories
 */
router.get('/categories', getCategoriesController);

/**
 * GET /api/equipment/:itemId
 */
router.get('/:itemId', getEquipmentByIdController);

export default router;




