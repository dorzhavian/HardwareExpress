import { updateLogClassification } from '../repositories/log.repository.js';
import { LogRow } from '../types/database.js';

const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001';

type AiServiceResponse = {
  classification: 'NORMAL' | 'ANOMALOUS';
};

function buildLogText(log: LogRow): string {
  const timestampValue = log.timestamp || new Date().toISOString();
  const date = new Date(timestampValue);
  const timeString = `${date.getHours()}:${date.getMinutes()}`;

  return `
    Analyze the following security log for ANY malicious activity (SQL Injection, XSS, Brute Force, Suspicious Time):
    
    User Input / IP: ${log.ip_address || 'Unknown'}
    Action: ${log.action}
    Description: ${log.description}
    Resource: ${log.resource}
    User Role: ${log.user_role}
    Time: ${timeString}
    Full JSON: ${JSON.stringify(log)}
  `.trim();
}

export async function analyzeLogAndStore(log: LogRow): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const logText = buildLogText(log);
    
    console.log('Sending to AI:', logText);

    const response = await fetch(`${aiServiceUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log_text: logText }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = (await response.json()) as AiServiceResponse;
    
    await updateLogClassification(log.log_id, data.classification);
    
    console.log(`Log ${log.log_id} classified as: ${data.classification}`);

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('AI Service timed out (Model took too long)');
    } else {
      console.error('Failed to analyze log:', error);
    }
  } finally {
    clearTimeout(timeout);
  }
}