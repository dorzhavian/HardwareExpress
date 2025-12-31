/**
 * Catalog Controller
 * 
 * Handles HTTP request/response for catalog/equipment endpoints.
 * No business logic - delegates to catalog service.
 * 
 * Decision: Controllers handle only HTTP concerns
 * Reason: Follows CURSOR_RULES.md: "No business logic inside controllers"
 *         Controllers = request/response handling only.
 * 
 * Alternative: Business logic in controllers
 * Rejected: Violates separation of concerns, harder to test,
 *           doesn't follow project architecture rules.
 */

import { Request, Response } from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  getEquipmentByCategory,
  searchEquipment,
} from '../services/catalog.service.js';

/**
 * GET /api/equipment
 * Get all equipment items
 * Optional query params: category, search
 */
export async function getAllEquipmentController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { category, search } = req.query;

    let equipment;
    if (category && typeof category === 'string') {
      equipment = await getEquipmentByCategory(category);
    } else if (search && typeof search === 'string') {
      equipment = await searchEquipment(search);
    } else {
      equipment = await getAllEquipment();
    }

    res.json(equipment);
  } catch (error) {
    console.error('Get all equipment error:', error);
    const statusCode = error instanceof Error && error.message.includes('Invalid')
      ? 400
      : 500;
    res.status(statusCode).json({
      error: statusCode === 400 ? 'Bad Request' : 'Internal Server Error',
      message: error instanceof Error ? error.message : 'An error occurred',
    });
  }
}

/**
 * GET /api/equipment/:itemId
 * Get equipment item by ID
 */
export async function getEquipmentByIdController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { itemId } = req.params;

    if (!itemId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Item ID is required',
      });
      return;
    }

    const equipment = await getEquipmentById(itemId);
    if (!equipment) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Equipment item not found',
      });
      return;
    }

    res.json(equipment);
  } catch (error) {
    console.error('Get equipment by ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching equipment',
    });
  }
}

/**
 * GET /api/equipment/categories
 * Get list of available categories
 */
export async function getCategoriesController(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const categories = [
      'All',
      'Laptops',
      'Monitors',
      'Peripherals',
      'Printers',
      'Components',
      'Storage',
    ];

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching categories',
    });
  }
}




