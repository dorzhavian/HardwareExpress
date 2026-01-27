/**
 * Database access layer for catalog_items table.
 */

import { database } from '../config/database.js';
import { CatalogItemRow, ItemCategory } from '../types/database.js';

/**
 * Get all catalog items
 * @returns Array of catalog item rows
 */
export async function getAllCatalogItems(): Promise<CatalogItemRow[]> {
  const { data, error } = await database
    .from('catalog_items')
    .select('*')
    .order('item_name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch catalog items: ${error.message}`);
  }

  return (data || []) as CatalogItemRow[];
}

/**
 * Get catalog item by ID
 * @param itemId - Item UUID
 * @returns Catalog item row or null if not found
 */
export async function getCatalogItemById(itemId: string): Promise<CatalogItemRow | null> {
  const { data, error } = await database
    .from('catalog_items')
    .select('*')
    .eq('item_id', itemId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to fetch catalog item: ${error.message}`);
  }

  return data as CatalogItemRow;
}

/**
 * Get catalog items by category
 * @param category - Item category
 * @returns Array of catalog item rows
 */
export async function getCatalogItemsByCategory(
  category: ItemCategory
): Promise<CatalogItemRow[]> {
  const { data, error } = await database
    .from('catalog_items')
    .select('*')
    .eq('category', category)
    .order('item_name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch catalog items by category: ${error.message}`);
  }

  return (data || []) as CatalogItemRow[];
}

/**
 * Search catalog items by name, description, or specification
 * @param query - Search query string
 * @returns Array of catalog item rows matching the query
 */
export async function searchCatalogItems(query: string): Promise<CatalogItemRow[]> {
  const searchPattern = `%${query}%`;
  
  // Supabase PostgREST syntax for OR conditions with ILIKE
  const { data, error } = await database
    .from('catalog_items')
    .select('*')
    .or(`item_name.ilike."${searchPattern}",description.ilike."${searchPattern}",specification.ilike."${searchPattern}"`)
    .order('item_name', { ascending: true });

  if (error) {
    throw new Error(`Failed to search catalog items: ${error.message}`);
  }

  return (data || []) as CatalogItemRow[];
}

