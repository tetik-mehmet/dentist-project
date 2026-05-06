import api from './api';

export type StaffRole = 'doctor' | 'assistant';

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRole | 'admin';
  isActive: boolean;
  createdAt: string;
}

export interface CreateStaffData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
}

export async function getStaff(): Promise<StaffMember[]> {
  const res = await api.get<StaffMember[]>('/api/users');
  return res.data;
}

export async function createStaff(data: CreateStaffData): Promise<StaffMember> {
  const res = await api.post<StaffMember>('/api/users', data);
  return res.data;
}

export async function deactivateStaff(id: string): Promise<void> {
  await api.delete(`/api/users/${id}`);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await api.patch('/api/users/me/password', { currentPassword, newPassword });
}
