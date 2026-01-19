/**
 * Log Controller
 * 
 * Handles HTTP request/response for log endpoints.
 * Admin-only operations.
 * No business logic - delegates to log service.
 * 
 * Decision: Controllers handle only HTTP concerns
 * Reason: Follows CURSOR_RULES.md: "No business logic inside controllers"
 *         Controllers = request/response handling only.
 * 
 * Alternative: Business logic in controllers
 * Rejected: Violates separation of concerns, harder to test,
 *           doesn't follow project architecture rules.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { getPaginatedLogs } from '../services/log.service.js';

const LOG_ACTIONS = ['login', 'logout', 'create', 'update', 'delete', 'approve'] as const;
const LOG_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
const LOG_STATUSES = ['success', 'failure'] as const;

type LogAction = (typeof LOG_ACTIONS)[number];
type LogSeverity = (typeof LOG_SEVERITIES)[number];
type LogStatus = (typeof LOG_STATUSES)[number];

function parseFilterParam(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  const parts = Array.isArray(value) ? value : [value];
  return parts
    .flatMap((entry) => entry.split(','))
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function validateFilter<T extends string>(
  values: string[],
  allowed: readonly T[],
  label: string
): T[] {
  const invalid = values.filter((value) => !allowed.includes(value as T));
  if (invalid.length > 0) {
    throw new Error(`${label} must be one of: ${allowed.join(', ')}`);
  }
  return values as T[];
}

/**
 * GET /api/logs
 * Get logs (admin only) with pagination
 * Query params: page, pageSize
 */
export async function getLogsController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const pageParam = req.query.page as string | undefined;
    const pageSizeParam = req.query.pageSize as string | undefined;

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 25;

    if (Number.isNaN(page) || page < 1) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Page must be a number greater than 0',
      });
      return;
    }

    if (Number.isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Page size must be a number between 1 and 100',
      });
      return;
    }

    const actionsRaw = parseFilterParam(req.query.action as string | string[] | undefined);
    const severitiesRaw = parseFilterParam(req.query.severity as string | string[] | undefined);
    const statusesRaw = parseFilterParam(req.query.status as string | string[] | undefined);

    let actions: LogAction[] = [];
    let severities: LogSeverity[] = [];
    let statuses: LogStatus[] = [];

    try {
      actions = validateFilter(actionsRaw, LOG_ACTIONS, 'action');
      severities = validateFilter(severitiesRaw, LOG_SEVERITIES, 'severity');
      statuses = validateFilter(statusesRaw, LOG_STATUSES, 'status');
    } catch (validationError) {
      res.status(400).json({
        error: 'Bad Request',
        message: validationError instanceof Error ? validationError.message : 'Invalid filter values',
      });
      return;
    }

    const result = await getPaginatedLogs(page, pageSize, {
      actions,
      severities,
      statuses,
    });
    res.json(result);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching logs',
    });
  }
}
