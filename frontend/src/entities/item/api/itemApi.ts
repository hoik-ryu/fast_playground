import { apiClient } from '@shared/api/client';
import { getApiData } from '@shared/api/getApiResponse';
import type { ApiResponse } from '@shared/api/types';

import type { Item } from '../model/types';

export async function listItems(name?: string, signal?: AbortSignal): Promise<Item[]> {
  const res = await apiClient.get<ApiResponse<Item[]>>('/items', {
    params: name ? { name } : undefined,
    signal,
  });
  return getApiData(res);
}

export async function getItem(id: number): Promise<Item> {
  const res = await apiClient.get<ApiResponse<Item>>(`/items/${id}`);
  return getApiData(res);
}
