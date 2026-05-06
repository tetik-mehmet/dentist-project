import api from './api';

export type TreatmentStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type StepStatus = 'pending' | 'completed' | 'skipped';

export interface TreatmentStep {
  id: string;
  title: string;
  description?: string;
  status: StepStatus;
  order: number;
  cost: number;
  treatmentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  id: string;
  title: string;
  description?: string;
  status: TreatmentStatus;
  totalCost: number;
  clinicId: string;
  patientId: string;
  patient: { id: string; firstName: string; lastName: string };
  steps: TreatmentStep[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTreatmentData {
  title: string;
  description?: string;
  patientId: string;
  totalCost?: number;
  steps?: { title: string; description?: string; order: number; cost?: number }[];
}

export async function getTreatments(patientId?: string): Promise<Treatment[]> {
  const res = await api.get<Treatment[]>('/api/treatments', {
    params: patientId ? { patientId } : {},
  });
  return res.data;
}

export async function createTreatment(data: CreateTreatmentData): Promise<Treatment> {
  const res = await api.post<Treatment>('/api/treatments', data);
  return res.data;
}

export async function updateTreatmentStatus(
  id: string,
  status: TreatmentStatus,
): Promise<Treatment> {
  const res = await api.patch<Treatment>(`/api/treatments/${id}`, { status });
  return res.data;
}

export async function updateStep(
  stepId: string,
  data: Partial<{ title: string; status: StepStatus; cost: number }>,
): Promise<TreatmentStep> {
  const res = await api.patch<TreatmentStep>(
    `/api/treatments/steps/${stepId}`,
    data,
  );
  return res.data;
}

export async function deleteTreatment(id: string): Promise<void> {
  await api.delete(`/api/treatments/${id}`);
}
