import api from './api';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  notes?: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientDetails extends Patient {
  appointments: any[];
  treatments: any[];
  payments: any[];
  files: any[];
}

export interface CreatePatientData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  notes?: string;
}

export async function getPatients(search?: string): Promise<Patient[]> {
  const params = search ? { search } : {};
  const res = await api.get<Patient[]>('/api/patients', { params });
  return res.data;
}

export async function getPatient(id: string): Promise<PatientDetails> {
  const res = await api.get<PatientDetails>(`/api/patients/${id}/details`);
  return res.data;
}

export async function createPatient(data: CreatePatientData): Promise<Patient> {
  const res = await api.post<Patient>('/api/patients', data);
  return res.data;
}

export async function updatePatient(
  id: string,
  data: Partial<CreatePatientData>,
): Promise<Patient> {
  const res = await api.patch<Patient>(`/api/patients/${id}`, data);
  return res.data;
}

export async function deletePatient(id: string): Promise<void> {
  await api.delete(`/api/patients/${id}`);
}
