import { getLogsPage } from '../repositories/log.repository.js';
import { LogResponse, PaginatedLogsResponse } from '../types/api.js';
import { LogRow } from '../types/database.js';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

/**
 * Transform database log row to API response
 */
function transformLogToResponse(log: LogRow): LogResponse {
  const aiClassification = log.ai_classification ?? 'PENDING';
  const aiAlert = aiClassification === 'ANOMALOUS';

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
    aiClassification,
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
