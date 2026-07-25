import type { UserMe } from '@entities/user';
import { userKeys } from '@entities/user';
import { apiClient } from '@shared/api/client';
import { queryClient } from '@shared/api/queryClient';
import type { ApiResponse } from '@shared/api/types';

import type { UserMeUpdate } from '../model/schema';

async function patchCurrentUser(payload: UserMeUpdate): Promise<{ data: UserMe; message: string }> {
  const res = await apiClient.patch<ApiResponse<UserMe>>('/users/me', payload);
  return { data: res.data.data, message: res.data.message };
}

/** 프로필 수정 후 me 캐시를 갱신한다. */
export async function updateProfile(
  payload: UserMeUpdate,
): Promise<{ data: UserMe; message: string }> {
  const result = await patchCurrentUser(payload);
  queryClient.setQueryData(userKeys.me(), result.data);
  return result;
}
