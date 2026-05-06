import api from './api';

export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface Payment {
  id: string;
  totalAmount: number;
  paidAmount: number;
  amount: number;
  status: PaymentStatus;
  notes?: string;
  paidAt?: string;
  clinicId: string;
  patientId: string;
  treatmentId?: string;
  patient: { id: string; firstName: string; lastName: string };
  treatment?: { id: string; title: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  total: number;
  paid: number;
  pending: number;
  count: number;
  pendingCount: number;
}

export async function getPayments(patientId?: string): Promise<Payment[]> {
  const res = await api.get<Payment[]>('/api/payments', {
    params: patientId ? { patientId } : {},
  });
  return res.data;
}

export async function getPaymentSummary(): Promise<PaymentSummary> {
  const res = await api.get<PaymentSummary>('/api/payments/summary');
  return res.data;
}

export async function createPayment(data: {
  patientId: string;
  treatmentId?: string;
  totalAmount: number;
  paidAmount?: number;
  notes?: string;
}): Promise<Payment> {
  const res = await api.post<Payment>('/api/payments', data);
  return res.data;
}

export async function addPayment(
  id: string,
  amount: number,
  notes?: string,
): Promise<Payment> {
  const res = await api.patch<Payment>(`/api/payments/${id}/pay`, {
    amount,
    notes,
  });
  return res.data;
}

export async function deletePayment(id: string): Promise<void> {
  await api.delete(`/api/payments/${id}`);
}
