/**
 * Log AI Service
 *
 * Sends log data to the Python AI microservice and stores the result.
 *
 * Decision: Call Python microservice over HTTP from Node
 * Reason: Keeps the AI model isolated from the Node runtime, allows independent
 *         scaling and deployment, and avoids mixing Python dependencies in TS.
 *
 * Alternative: Connect Python directly to the database
 * Rejected: Bypasses backend control, splits data access, and breaks traceability.
 */

import { createLogAi } from '../repositories/log-ai.repository.js';
import { LogRow } from '../types/database.js';

const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';
const aiServiceTimeoutMs = Number(process.env.AI_SERVICE_TIMEOUT_MS || '2000');
const defaultThreshold = Number(process.env.AI_SCORE_THRESHOLD || '0.8');

type AiServiceResponse = {
  model_name: string;
  label: string;
  score: number;
  threshold?: number;
  is_suspicious: boolean;
  ai_summary?: string | null;
  raw?: unknown | null;
};

function buildLogText(log: LogRow): string {
  const parts = [
    `action=${log.action}`,
    `resource=${log.resource}`,
    `status=${log.status}`,
    `severity=${log.severity}`,
  ];

  if (log.user_role) {
    parts.push(`user_role=${log.user_role}`);
  }
  if (log.ip_address) {
    parts.push(`ip=${log.ip_address}`);
  }
  if (log.description) {
    parts.push(`description=${log.description}`);
  }

  return parts.join(' | ');
}

function normalizeResponse(raw: AiServiceResponse): AiServiceResponse {
  return {
    model_name: raw.model_name || 'unknown',
    label: raw.label || 'unknown',
    score: Number(raw.score),
    threshold: typeof raw.threshold === 'number' ? raw.threshold : defaultThreshold,
    is_suspicious: Boolean(raw.is_suspicious),
    ai_summary: raw.ai_summary ?? null,
    raw: raw.raw ?? null,
  };
}

/**
 * Analyze a log using the AI microservice and store the result in logs_ai.
 *
 * Decision: Best-effort analysis that never throws to caller
 * Reason: AI analysis should not block or break core logging flow.
 *
 * Alternative: Throw on AI failure
 * Rejected: Would introduce instability in critical request paths.
 */
export async function analyzeLogAndStore(log: LogRow): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), aiServiceTimeoutMs);

  try {
    const response = await fetch(`${aiServiceUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        log_id: log.log_id,
        text: buildLogText(log),
        metadata: {
          action: log.action,
          resource: log.resource,
          status: log.status,
          severity: log.severity,
          user_id: log.user_id,
          user_role: log.user_role,
          ip_address: log.ip_address,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as AiServiceResponse;
    const normalized = normalizeResponse(data);

    await createLogAi({
      log_id: log.log_id,
      model_name: normalized.model_name,
      label: normalized.label,
      score: normalized.score,
      threshold: normalized.threshold ?? defaultThreshold,
      is_suspicious: normalized.is_suspicious,
      ai_summary: normalized.ai_summary,
      raw: normalized.raw,
    });
  } catch (error) {
    console.error('Failed to analyze log with AI service:', error);
  } finally {
    clearTimeout(timeout);
  }
}
