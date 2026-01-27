import {
  getAllCatalogItems,
  getCatalogItemById,
  getCatalogItemsByCategory,
  searchCatalogItems,
} from '../repositories/catalog.repository.js';
import { EquipmentResponse } from '../types/api.js';
import { CatalogItemRow } from '../types/database.js';

/**
 * Transform database catalog item to API response
 * @param item - Database catalog item row
 * @returns API equipment response
 */
export function transformCatalogItemToResponse(item: CatalogItemRow): EquipmentResponse {
  return {
    id: item.item_id,
    name: item.item_name,
    category: item.category,
    description: item.description || '',
    specifications: item.specification || '', // singular to plural
    unitPrice: item.price, 
    imageUrl: item.image_url || '',
    inStock: item.in_stock ?? true, // Default to true if null
    stockQuantity: item.quantity,
  };
}

/**
 * Get all catalog items
 * 
 * @returns Array of equipment responses
 */
export async function getAllEquipment(): Promise<EquipmentResponse[]> {
  const items = await getAllCatalogItems();
  return items.map(transformCatalogItemToResponse);
}

/**
 * Get catalog item by ID
 * 
 * @param itemId - Item UUID
 * @returns Equipment response or null if not found
 */
export async function getEquipmentById(
  itemId: string
): Promise<EquipmentResponse | null> {
  const item = await getCatalogItemById(itemId);
  if (!item) {
    return null;
  }
  return transformCatalogItemToResponse(item);
}

/**
 * Get catalog items by category
 * @param category - Item category
 * @returns Array of equipment responses
 */
export async function getEquipmentByCategory(
  category: string
): Promise<EquipmentResponse[]> {
  // Validate category matches enum
  const validCategories = [
    'Laptops',
    'Monitors',
    'Peripherals',
    'Printers',
    'Components',
    'Storage',
  ];
  
  if (!validCategories.includes(category)) {
    throw new Error(`Invalid category: ${category}`);
  }

  const items = await getCatalogItemsByCategory(category as any);
  return items.map(transformCatalogItemToResponse);
}

/**
 * Search catalog items
 * 
 * @param query - Search query string
 * @returns Array of equipment responses matching the query
 */
export async function searchEquipment(query: string): Promise<EquipmentResponse[]> {
  if (!query || query.trim().length === 0) {
    // Empty query returns all items
    return getAllEquipment();
  }

  const items = await searchCatalogItems(query.trim());
  return items.map(transformCatalogItemToResponse);
}

