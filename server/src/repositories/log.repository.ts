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
import { LogWithAiRow } from '../types/database.js';

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

/**
 * Get logs with pagination
 * 
 * @param offset - Number of records to skip
 * @param limit - Number of records to fetch
 * @returns Logs and total count
 */
export async function getLogsPage(params: {
  offset: number;
  limit: number;
  filters?: {
    actions?: string[];
    severities?: string[];
    statuses?: string[];
  };
}): Promise<{ logs: LogWithAiRow[]; total: number }> {
  /**
   * Decision: Join logs_ai in the same query
   * Reason: Single round trip with nested results is more efficient
   *         than per-log lookups for AI scores.
   * Alternative: Separate query for logs_ai per log
   * Rejected: N+1 queries and unnecessary latency.
   */
  let query = database
    .from('logs')
    .select(
      'log_id,timestamp,user_id,user_role,action,resource,status,ip_address,description,severity,logs_ai(score,threshold)',
      { count: 'exact' }
    )
    .order('timestamp', { ascending: false });

  if (params.filters?.actions && params.filters.actions.length > 0) {
    query = query.in('action', params.filters.actions);
  }

  if (params.filters?.severities && params.filters.severities.length > 0) {
    query = query.in('severity', params.filters.severities);
  }

  if (params.filters?.statuses && params.filters.statuses.length > 0) {
    query = query.in('status', params.filters.statuses);
  }

  const { data, error, count } = await query.range(
    params.offset,
    params.offset + params.limit - 1
  );

  if (error) {
    throw new Error(`Failed to fetch logs: ${error.message}`);
  }

  return {
    logs: (data || []) as LogWithAiRow[],
    total: count ?? 0,
  };
}




