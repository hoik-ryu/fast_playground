import { apiClient } from '@shared/api/client';
import type { ApiResponse } from '@shared/api/types';

import type { Item } from '../model/types';

export async function listItems(name?: string): Promise<Item[]> {
  const res = await apiClient.get<ApiResponse<Item[]>>('/items', {
    params: name ? { name } : undefined,
  });
  return res.data.data;
}

export async function getItem(id: number): Promise<Item> {
  const res = await apiClient.get<ApiResponse<Item>>(`/items/${id}`);
  return res.data.data;
}
