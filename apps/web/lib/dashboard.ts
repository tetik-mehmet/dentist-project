import api from './api';

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  activeTreatments: number;
  pendingPayments: number;
}

export interface RecentPatient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}

export interface UpcomingAppointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  patient: { id: string; firstName: string; lastName: string };
  doctor: { id: string; firstName: string; lastName: string };
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  createdAt: string;
  newData?: Record<string, any>;
  user: { firstName: string; lastName: string; role: string };
}

export interface DashboardData {
  stats: DashboardStats;
  recentPatients: RecentPatient[];
  upcomingAppointments: UpcomingAppointment[];
  recentAuditLogs: AuditLogEntry[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const res = await api.get<DashboardData>('/api/dashboard/stats');
  return res.data;
}
