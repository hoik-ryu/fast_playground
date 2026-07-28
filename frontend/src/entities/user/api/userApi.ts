import { apiClient } from '@shared/api/client';
import { getApiData } from '@shared/api/getApiResponse';
import type { ApiResponse } from '@shared/api/types';

import type { UserMe, UserMeContext } from '../model/types';

export async function getCurrentUser(): Promise<UserMe> {
  const res = await apiClient.get<ApiResponse<UserMe>>('/users/me');
  return getApiData(res);
}

export async function getUserContext(): Promise<UserMeContext> {
  const res = await apiClient.get<ApiResponse<UserMeContext>>('/users/me/context');
  return getApiData(res);
}
