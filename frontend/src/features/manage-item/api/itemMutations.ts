import type { Item } from '@entities/item';
import { itemKeys } from '@entities/item';
import { apiClient } from '@shared/api/client';
import { getApiData } from '@shared/api/getApiResponse';
import { queryClient } from '@shared/api/queryClient';
import type { ApiResponse } from '@shared/api/types';

import type { ItemCreate, ItemUpdate } from '../model/types';

export async function createItem(payload: ItemCreate): Promise<Item> {
  const res = await apiClient.post<ApiResponse<Item>>('/items', payload);
  await queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
  return getApiData(res);
}

export async function updateItem(id: number, payload: ItemUpdate): Promise<Item> {
  const res = await apiClient.put<ApiResponse<Item>>(`/items/${id}`, payload);
  await queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
  return getApiData(res);
}

export async function deleteItem(id: number): Promise<Item> {
  const res = await apiClient.delete<ApiResponse<Item>>(`/items/${id}`);
  await queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
  return getApiData(res);
}
