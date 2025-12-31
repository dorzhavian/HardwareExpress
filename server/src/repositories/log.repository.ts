/**
 * Log Repository
 * 
 * Database access layer for logs table.
 * Contains only database queries, no business logic.
 * 
 * Decision: Repository pattern for database access
 * Reason: Separates data access from business logic, makes testing easier,
 *         allows swapping database implementations if needed.
 * 
 * Alternative: Direct database calls in logging service
 * Rejected: Violates separation of concerns, makes testing harder,
 *           doesn't follow CURSOR_RULES.md architecture.
 */

import { database } from '../config/database.js';
import { LogRow } from '../types/database.js';

/**
 * Create a log entry
 * 
 * @param logData - Log data matching database schema
 * @returns Created log row
 */
export async function createLog(logData: {
  user_id: string | null;
  user_role: string | null;
  action: string;
  resource: string;
  status: string;
  ip_address: string | null;
  description: string | null;
  severity: string;
}): Promise<LogRow> {
  const { data, error } = await database
    .from('logs')
    .insert({
      user_id: logData.user_id,
      user_role: logData.user_role,
      action: logData.action,
      resource: logData.resource,
      status: logData.status,
      ip_address: logData.ip_address,
      description: logData.description,
      severity: logData.severity,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create log: ${error.message}`);
  }

  return data as LogRow;
}




