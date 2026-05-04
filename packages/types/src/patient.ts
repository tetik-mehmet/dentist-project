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

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  notes?: string;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {}
