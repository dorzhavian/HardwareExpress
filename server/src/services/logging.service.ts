/**
 * Logging Service
 * 
 * Centralized logging service for audit trail.
 * Handles all logging logic and severity determination.
 * 
 * Decision: Centralized logging service
 * Reason: 
 * - Single source of truth for logging logic
 * - Consistent logging format across the system
 * - Easy to maintain and update logging behavior
 * - Reusable across all controllers/services
 * 
 * Alternative: Inline logging in each controller/service
 * Rejected: Code duplication, inconsistent logging, harder to maintain,
 *           violates DRY principle.
 * 
 * Alternative: Logging middleware that intercepts all requests
 * Rejected: Too broad, logs everything including non-significant actions.
 *           We need selective logging for specific business events.
 */

import { createLog } from '../repositories/log.repository.js';
import { analyzeLogAndStore } from './log-ai.service.js';
import { LogAction, LogResource, LogStatus, LogSeverity, UserRole } from '../types/database.js';

/**
 * Extract IP address from request
 * Handles proxy headers (X-Forwarded-For, X-Real-IP)
 * 
 * Decision: Check proxy headers for IP address
 * Reason: In production, requests often go through proxies/load balancers.
 *         Real client IP is in X-Forwarded-For or X-Real-IP headers.
 * 
 * Alternative: Use req.ip or req.connection.remoteAddress only
 * Rejected: Doesn't work behind proxies, returns proxy IP instead of client IP.
 * 
 * @param req - Express request object
 * @returns IP address string or null
 */
export function extractIpAddress(req: any): string | null {
  // Check X-Forwarded-For header (first IP is original client)
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
 * 
 * Decision: Severity mapping based on action type and success/failure
 * Reason: Provides meaningful severity levels for log analysis and alerting.
 *         Critical operations (delete, failed login) get higher severity.
 * 
 * Alternative: All logs have same severity
 * Rejected: Makes log analysis harder, can't prioritize important events.
 * 
 * Alternative: Configurable severity mapping
 * Rejected: Adds complexity, hardcoded mapping is sufficient for Phase 5.
 * 
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
 * 
 * Decision: Async logging (fire and forget)
 * Reason: Logging shouldn't block request processing. Errors in logging
 *         shouldn't affect business logic.
 * 
 * Alternative: Synchronous logging with await
 * Rejected: Slows down request processing, logging errors could break requests.
 * 
 * Alternative: Queue-based logging
 * Rejected: Adds complexity, requires queue infrastructure. Fire-and-forget
 *           is sufficient for Phase 5.
 * 
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
 * 
 * Decision: Convenience functions for common logging patterns
 * Reason: Reduces boilerplate, ensures consistent logging format,
 *         makes it easier to log common events.
 * 
 * Alternative: Always use logAction directly
 * Rejected: More verbose, easier to make mistakes, less readable.
 * 
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
 * 
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
 * 
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




