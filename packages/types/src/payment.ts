export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface Payment {
  id: string;
  amount: number;
  totalAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  notes?: string;
  paidAt?: string;
  clinicId: string;
  patientId: string;
  treatmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  amount: number;
  totalAmount: number;
  patientId: string;
  treatmentId?: string;
  notes?: string;
}
