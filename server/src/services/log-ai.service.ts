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
  raw?: unknown | null;
};

/**
 * Decision: Derive a single negative-class score for storage
 * Reason: Admins interpret score as "negative likelihood" when judging suspicion.
 *
 * Alternative: Store model's primary score as-is
 * Rejected: Causes confusion when positive-class scores are high but flagged suspicious.
 */
function deriveNegativeScore(normalized: AiServiceResponse): number {
  const rawNegative = extractNegativeScore(normalized.raw);
  if (typeof rawNegative === 'number') {
    return clampScore(rawNegative);
  }

  const labelUpper = normalized.label?.toUpperCase();
  if (labelUpper === 'NEGATIVE') {
    return clampScore(normalized.score);
  }
  if (labelUpper === 'POSITIVE') {
    return clampScore(1 - normalized.score);
  }

  return clampScore(normalized.score);
}

function extractNegativeScore(raw: unknown | null): number | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const rawArray = Array.isArray(raw) ? raw : null;
  if (rawArray) {
    return findNegativeScoreInArray(rawArray);
  }

  const rawRecord = raw as Record<string, unknown>;
  const classifierOutput = rawRecord.classifier_output;
  if (Array.isArray(classifierOutput)) {
    return findNegativeScoreInArray(classifierOutput);
  }

  return null;
}

function findNegativeScoreInArray(items: unknown[]): number | null {
  for (const entry of items) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const record = entry as Record<string, unknown>;
    const label = typeof record.label === 'string' ? record.label.toUpperCase() : '';
    if (label === 'NEGATIVE' && typeof record.score === 'number') {
      return record.score;
    }
  }

  return null;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

/**
 * Decision: Send a fixed 4-field frame to the AI service
 * Reason: Aligns with the model's expected signal format for consistent scoring.
 *
 * Alternative: Send description-only text
 * Rejected: The model is tuned to recognize structured log signals.
 */
function buildLogText(log: LogRow): string {
  return [
    `user_role=${log.user_role ?? 'null'}`,
    `action=${log.action}`,
    `resource=${log.resource}`,
    `status=${log.status}`,
  ].join(' | ');
}

/**
 * Decision: Mask UUIDs in log descriptions before AI analysis
 * Reason: Prevents model bias and removes sensitive identifiers from input.
 *
 * Alternative: Send raw descriptions with UUIDs intact
 * Rejected: Exposes identifiers and can skew model attention to IDs.
 */
function scrubUuids(text: string): string {
  const uuidRegex = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
  const orderIdRegex = /\bOrder ID:\s*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

  return text
    .replace(orderIdRegex, 'Order ID: <ORDER_ID>')
    .replace(uuidRegex, '<ID>');
}

function normalizeResponse(raw: AiServiceResponse): AiServiceResponse {
  return {
    model_name: raw.model_name || 'unknown',
    label: raw.label || 'unknown',
    score: Number(raw.score),
    threshold: typeof raw.threshold === 'number' ? raw.threshold : defaultThreshold,
    is_suspicious: Boolean(raw.is_suspicious),
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
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as AiServiceResponse;
    const normalized = normalizeResponse(data);
    const negativeScore = deriveNegativeScore(normalized);
    const threshold = normalized.threshold ?? defaultThreshold;

    await createLogAi({
      log_id: log.log_id,
      model_name: normalized.model_name,
      score: negativeScore,
      threshold,
      is_suspicious: negativeScore >= threshold,
      raw: normalized.raw,
    });
  } catch (error) {
    console.error('Failed to analyze log with AI service:', error);
  } finally {
    clearTimeout(timeout);
  }
}
