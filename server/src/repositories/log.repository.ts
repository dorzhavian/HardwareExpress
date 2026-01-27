import { database } from '../config/database.js';
import { LogRow } from '../types/database.js';

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

export async function getLogsPage(params: {
  offset: number;
  limit: number;
  filters?: {
    actions?: string[];
    severities?: string[];
    statuses?: string[];
  };
}): Promise<{ logs: LogRow[]; total: number }> {
  let query = database
    .from('logs')
    .select(
      'log_id,timestamp,user_id,user_role,action,resource,status,ip_address,description,severity,ai_classification',
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
    logs: (data || []) as LogRow[],
    total: count ?? 0,
  };
}

export async function updateLogClassification(
  log_id: string,
  classification: 'NORMAL' | 'ANOMALOUS',
  explanation?: string
): Promise<void> {
  const updateData: { ai_classification: string; description?: string } = {
    ai_classification: classification,
  };

  if (explanation !== undefined) {
    updateData.description = explanation;
  }

  const { error } = await database
    .from('logs')
    .update(updateData)
    .eq('log_id', log_id);

  if (error) {
    throw new Error(`Failed to update log classification: ${error.message}`);
  }
}