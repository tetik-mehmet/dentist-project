export type TreatmentStatus =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

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
  steps: TreatmentStep[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTreatmentRequest {
  title: string;
  description?: string;
  totalCost?: number;
  patientId: string;
  steps?: {
    title: string;
    description?: string;
    order: number;
    cost?: number;
  }[];
}
