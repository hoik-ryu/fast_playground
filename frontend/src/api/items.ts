import { apiClient } from "./client";
import type { Item, ItemCreate, ItemUpdate } from "../types/item";

// 백엔드 Item CRUD 엔드포인트 (app/api/v1/endpoints/items.py) 매핑.

export async function listItems(name?: string): Promise<Item[]> {
  const res = await apiClient.get<Item[]>("/items", {
    params: name ? { name } : undefined,
  });
  return res.data;
}

export async function getItem(id: number): Promise<Item> {
  const res = await apiClient.get<Item>(`/items/${id}`);
  return res.data;
}

export async function createItem(payload: ItemCreate): Promise<Item> {
  const res = await apiClient.post<Item>("/items", payload);
  return res.data;
}

export async function updateItem(id: number, payload: ItemUpdate): Promise<Item> {
  const res = await apiClient.put<Item>(`/items/${id}`, payload);
  return res.data;
}

export async function deleteItem(id: number): Promise<Item> {
  const res = await apiClient.delete<Item>(`/items/${id}`);
  return res.data;
}
