import api from '../../lib/axios';
import type { User } from '../../types';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
}

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  department: string;
  designation: string;
  phone: string;
  officeLocation: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/signup', data);
  return res.data;
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
  const res = await api.post('/auth/refresh', { refreshToken });
  return res.data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPassword(
  email: string,
  otp: string,
  newPassword: string
): Promise<{ message: string }> {
  const res = await api.post<{ message: string }>('/auth/reset-password', {
    email,
    otp,
    newPassword,
  });
  return res.data;
}

export async function getProfile(): Promise<User> {
  const res = await api.get<User>('/auth/me');
  return res.data;
}

export async function logoutApi(): Promise<void> {
  await api.post('/auth/logout');
}