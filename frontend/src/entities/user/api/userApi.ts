import { apiClient } from '@shared/api/client';
import type { ApiResponse } from '@shared/api/types';

import type { UserMe, UserMeContext } from '../model/types';

export async function getCurrentUser(): Promise<UserMe> {
  const res = await apiClient.get<ApiResponse<UserMe>>('/users/me');
  return res.data.data;
}

export async function getUserContext(): Promise<UserMeContext> {
  const res = await apiClient.get<ApiResponse<UserMeContext>>('/users/me/context');
  return res.data.data;
}
