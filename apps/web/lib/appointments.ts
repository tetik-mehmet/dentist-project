import api from './api';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface AppointmentPatient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AppointmentDoctor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  startTime: string;
  endTime: string;
  patientId: string;
  doctorId: string;
  notes?: string;
}

export async function getAppointments(params?: {
  patientId?: string;
  doctorId?: string;
  from?: string;
  to?: string;
}): Promise<Appointment[]> {
  const res = await api.get<Appointment[]>('/api/appointments', { params });
  return res.data;
}

export async function createAppointment(data: CreateAppointmentData): Promise<Appointment> {
  const res = await api.post<Appointment>('/api/appointments', data);
  return res.data;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<Appointment> {
  const res = await api.patch<Appointment>(`/api/appointments/${id}`, { status });
  return res.data;
}

export async function deleteAppointment(id: string): Promise<void> {
  await api.delete(`/api/appointments/${id}`);
}
