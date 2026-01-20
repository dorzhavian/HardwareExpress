/**
 * Log Service
 * 
 * Business logic for log retrieval and pagination.
 * Transforms database rows to API response format.
 * 
 * Decision: Pagination handled in service layer
 * Reason: Centralizes pagination logic and response formatting.
 *         Keeps controllers thin and repositories focused on data access.
 * 
 * Alternative: Pagination logic in controller
 * Rejected: Controllers should only handle HTTP concerns per CURSOR_RULES.md.
 */

import { getLogsPage } from '../repositories/log.repository.js';
import { LogResponse, PaginatedLogsResponse } from '../types/api.js';
import { LogWithAiRow } from '../types/database.js';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

/**
 * Transform database log row to API response
 * 
 * Decision: Transform in service layer
 * Reason: Keeps database types separate from API types.
 *         Single transformation point for log data.
 * 
 * Alternative: Transform in repository or controller
 * Rejected: Repository should return raw database types.
 *           Controller should only handle HTTP concerns.
 */
function transformLogToResponse(log: LogWithAiRow): LogResponse {
  /**
   * Decision: Mark alert if any AI score exceeds its threshold
   * Reason: A single suspicious model result should flag the log for review.
   * Alternative: Use only the latest model result
   * Rejected: Requires extra ordering data and can hide earlier high-risk scores.
   */
  const aiAlert = Array.isArray(log.logs_ai)
    ? log.logs_ai.some((entry) => entry.score > entry.threshold)
    : false;

  return {
    id: log.log_id,
    timestamp: log.timestamp,
    userId: log.user_id,
    userRole: log.user_role,
    action: log.action,
    resource: log.resource,
    status: log.status,
    ipAddress: log.ip_address,
    description: log.description,
    severity: log.severity,
    aiAlert,
  };
}

/**
 * Get paginated logs
 * 
 * @param page - Page number (1-based)
 * @param pageSize - Number of items per page
 * @returns Paginated logs response
 */
export async function getPaginatedLogs(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
  filters?: {
    actions?: Array<'login' | 'logout' | 'create' | 'update' | 'delete' | 'approve'>;
    severities?: Array<'low' | 'medium' | 'high' | 'critical'>;
    statuses?: Array<'success' | 'failure'>;
  }
): Promise<PaginatedLogsResponse> {
  const safePageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const offset = (page - 1) * safePageSize;

  const { logs, total } = await getLogsPage({
    offset,
    limit: safePageSize,
    filters: {
      actions: filters?.actions ?? [],
      severities: filters?.severities ?? [],
      statuses: filters?.statuses ?? [],
    },
  });

  const totalPages = total === 0 ? 0 : Math.ceil(total / safePageSize);

  return {
    items: logs.map(transformLogToResponse),
    page,
    pageSize: safePageSize,
    total,
    totalPages,
  };
}
