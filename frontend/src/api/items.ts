import { apiClient } from "./client";
import type { ApiResponse } from "../types/api";
import type { Item, ItemCreate, ItemUpdate } from "../types/item";

// 백엔드 Item CRUD 엔드포인트 (app/api/v1/endpoints/items.py) 매핑.
// 성공 응답은 { success, message, data } 공통 형식입니다.

export async function listItems(name?: string): Promise<Item[]> {
  const res = await apiClient.get<ApiResponse<Item[]>>("/items", {
    params: name ? { name } : undefined,
  });
  return res.data.data;
}

export async function getItem(id: number): Promise<Item> {
  const res = await apiClient.get<ApiResponse<Item>>(`/items/${id}`);
  return res.data.data;
}

export async function createItem(payload: ItemCreate): Promise<Item> {
  const res = await apiClient.post<ApiResponse<Item>>("/items", payload);
  return res.data.data;
}

export async function updateItem(id: number, payload: ItemUpdate): Promise<Item> {
  const res = await apiClient.put<ApiResponse<Item>>(`/items/${id}`, payload);
  return res.data.data;
}

export async function deleteItem(id: number): Promise<Item> {
  const res = await apiClient.delete<ApiResponse<Item>>(`/items/${id}`);
  return res.data.data;
}
