import { apiClient } from '@shared/api/client';
import { getApiData, getApiMessage } from '@shared/api/getApiResponse';
import { refreshClient } from '@shared/api/refreshClient';
import type { ApiResponse } from '@shared/api/types';

import type { LoginRequest, LoginTokens, RegisterRequest, RegisterUserData } from '../model/types';

export async function registerUser(
  payload: RegisterRequest,
): Promise<{ data: RegisterUserData; message: string }> {
  const res = await apiClient.post<ApiResponse<RegisterUserData>>('/auth/register', payload);
  return { data: getApiData(res), message: getApiMessage(res) };
}

export async function loginUser(payload: LoginRequest): Promise<LoginTokens> {
  const res = await apiClient.post<ApiResponse<LoginTokens>>('/auth/login', payload);
  return getApiData(res);
}

export async function logoutUser(refreshToken: string): Promise<void> {
  // data 미사용 — 성공 여부만 확인
  await refreshClient.post<ApiResponse<null>>('/auth/logout', {
    refresh_token: refreshToken,
  });
}
