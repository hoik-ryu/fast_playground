import { apiClient } from '@shared/api/client';
import type { ApiResponse } from '@shared/api/types';

import type { ChangePasswordRequest } from '../model/schema';

export async function changePassword(payload: ChangePasswordRequest): Promise<string> {
  const res = await apiClient.patch<ApiResponse<null>>('/users/me/password', payload);
  return res.data.message;
}
