import { createLog } from '../repositories/log.repository.js';
import { analyzeLogAndStore } from './log-ai.service.js';
import { LogAction, LogResource, LogStatus, LogSeverity, UserRole } from '../types/database.js';

/**
 * Extract IP address from request
 * @param req - Express request object
 * @returns IP address string or null
 */
export function extractIpAddress(req: any): string | null {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    return ips.split(',')[0].trim();
  }

  // Check X-Real-IP header
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Fallback to connection remote address
  return req.ip || req.connection?.remoteAddress || null;
}

/**
 * Determine severity level based on action and status
 * @param action - Log action
 * @param status - Log status (success/failure)
 * @param resource - Log resource
 * @returns Severity level
 */
function determineSeverity(
  action: LogAction,
  status: LogStatus,
  resource: LogResource
): LogSeverity {
  // Failed operations are always at least medium severity
  if (status === 'failure') {
    // Failed login/auth is high severity (security concern)
    if (resource === 'auth') {
      return 'high';
    }
    // Other failures are medium
    return 'medium';
  }

  // Success operations severity based on action
  switch (action) {
    case 'delete':
      // Deletions are high severity (destructive action)
      return 'high';
    case 'approve':
      // Approvals are medium severity (important business action)
      return 'medium';
    case 'create':
    case 'update':
      // Creates and updates are low severity (normal operations)
      return 'low';
    case 'login':
      // Successful login is low severity (normal operation)
      return 'low';
    case 'logout':
      // Logout is low severity (normal operation)
      return 'low';
    default:
      return 'low';
  }
}

/**
 * Create a log entry
 * @param params - Logging parameters
 */
export async function logAction(params: {
  user_id: string | null;
  user_role: UserRole | null;
  action: LogAction;
  resource: LogResource;
  status: LogStatus;
  ip_address: string | null;
  description?: string | null;
  severity?: LogSeverity;
}): Promise<void> {
  try {
    const severity = params.severity || determineSeverity(
      params.action,
      params.status,
      params.resource
    );

    const createdLog = await createLog({
      user_id: params.user_id,
      user_role: params.user_role,
      action: params.action,
      resource: params.resource,
      status: params.status,
      ip_address: params.ip_address,
      description: params.description || null,
      severity,
    });

    void analyzeLogAndStore(createdLog);
  } catch (error) {
    // Log to console as fallback if database logging fails
    // This ensures we don't lose critical log information
    console.error('Failed to write log to database:', error);
    console.error('Log data:', params);
  }
}

/**
 * Helper function to log authentication events
 * @param params - Authentication log parameters
 */
export async function logAuthEvent(params: {
  user_id: string | null;
  user_role: UserRole | null;
  action: 'login' | 'logout';
  status: LogStatus;
  ip_address: string | null;
  description?: string;
}): Promise<void> {
  await logAction({
    user_id: params.user_id,
    user_role: params.user_role,
    action: params.action,
    resource: 'auth',
    status: params.status,
    ip_address: params.ip_address,
    description: params.description,
  });
}

/**
 * Helper function to log CRUD operations
 * @param params - CRUD log parameters
 */
export async function logCrudEvent(params: {
  user_id: string | null;
  user_role: UserRole | null;
  action: 'create' | 'update' | 'delete';
  resource: LogResource;
  status: LogStatus;
  ip_address: string | null;
  description?: string;
  resourceId?: string;
}): Promise<void> {
  const description = params.resourceId
    ? `${params.description || ''} (ID: ${params.resourceId})`.trim()
    : params.description;

  await logAction({
    user_id: params.user_id,
    user_role: params.user_role,
    action: params.action,
    resource: params.resource,
    status: params.status,
    ip_address: params.ip_address,
    description: description || null,
  });
}

/**
 * Helper function to log order approval events
 * @param params - Approval log parameters
 */
export async function logApprovalEvent(params: {
  user_id: string | null;
  user_role: UserRole | null;
  status: LogStatus;
  ip_address: string | null;
  description?: string;
  orderId?: string;
}): Promise<void> {
  const description = params.orderId
    ? `${params.description || 'Order approval'} (Order ID: ${params.orderId})`.trim()
    : params.description;

  await logAction({
    user_id: params.user_id,
    user_role: params.user_role,
    action: 'approve',
    resource: 'order',
    status: params.status,
    ip_address: params.ip_address,
    description: description || null,
  });
}




