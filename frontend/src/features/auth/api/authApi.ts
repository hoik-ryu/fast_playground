import { apiClient } from '@shared/api/client';
import { refreshClient } from '@shared/api/refreshClient';
import type { ApiResponse } from '@shared/api/types';

import type { LoginRequest, LoginTokens, RegisterRequest, RegisterUserData } from '../model/types';

export async function registerUser(
  payload: RegisterRequest,
): Promise<{ data: RegisterUserData; message: string }> {
  const res = await apiClient.post<ApiResponse<RegisterUserData>>('/auth/register', payload);
  return { data: res.data.data, message: res.data.message };
}

export async function loginUser(payload: LoginRequest): Promise<LoginTokens> {
  const res = await apiClient.post<ApiResponse<LoginTokens>>('/auth/login', payload);
  return res.data.data;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await refreshClient.post<ApiResponse<null>>('/auth/logout', {
    refresh_token: refreshToken,
  });
}
