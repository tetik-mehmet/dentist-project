export type Role = 'admin' | 'doctor' | 'assistant';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  clinicId: string;
}
