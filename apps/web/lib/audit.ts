import api from './api';
import { AuditLogEntry } from './dashboard';

export interface AuditLogsQuery {
  entityType?: string;
  userId?: string;
  limit?: number;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
}

export async function getAuditLogs(query?: AuditLogsQuery): Promise<AuditLogEntry[]> {
  const params = new URLSearchParams();
  if (query?.entityType) params.set('entityType', query.entityType);
  if (query?.userId) params.set('userId', query.userId);
  if (query?.limit) params.set('limit', String(query.limit));
  if (query?.dateFrom) params.set('dateFrom', query.dateFrom);
  if (query?.dateTo) params.set('dateTo', query.dateTo);

  const res = await api.get<AuditLogEntry[]>(`/api/audit?${params.toString()}`);
  return res.data;
}
