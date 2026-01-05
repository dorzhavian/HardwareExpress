/**
 * Log AI Repository
 *
 * Database access layer for logs_ai table.
 * Contains only database queries, no business logic.
 *
 * Decision: Dedicated repository for logs_ai
 * Reason: Keeps AI analysis persistence isolated from logging logic,
 *         preserves clean separation of concerns.
 *
 * Alternative: Insert logs_ai directly inside logging service
 * Rejected: Mixes business logic with data access, harder to test.
 */

import { database } from '../config/database.js';
import { LogAiRow } from '../types/database.js';

/**
 * Create a logs_ai entry
 *
 * @param logAiData - AI analysis data matching database schema
 * @returns Created logs_ai row
 */
export async function createLogAi(logAiData: {
  log_id: string;
  model_name: string;
  label: string;
  score: number;
  threshold: number;
  is_suspicious: boolean;
  ai_summary?: string | null;
  raw?: unknown | null;
}): Promise<LogAiRow> {
  const { data, error } = await database
    .from('logs_ai')
    .insert({
      log_id: logAiData.log_id,
      model_name: logAiData.model_name,
      label: logAiData.label,
      score: logAiData.score,
      threshold: logAiData.threshold,
      is_suspicious: logAiData.is_suspicious,
      ai_summary: logAiData.ai_summary ?? null,
      raw: logAiData.raw ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create logs_ai entry: ${error.message}`);
  }

  return data as LogAiRow;
}
