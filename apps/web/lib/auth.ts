import api from './api';
import { AuthUser } from '@/types/auth';

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await api.post<{ user: AuthUser }>('/api/auth/login', {
    email,
    password,
  });
  return res.data.user;
}

export async function logout(): Promise<void> {
  await api.post('/api/auth/logout');
}

export async function getMe(): Promise<AuthUser | null> {
  try {
    const res = await api.get<AuthUser>('/api/auth/me');
    return res.data;
  } catch {
    return null;
  }
}
