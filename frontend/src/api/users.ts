import { apiClient } from "./client";
import type { ApiResponse } from "../types/api";
import type { ChangePasswordRequest, UserMe, UserMeContext, UserMeUpdate } from "../types/auth";

export async function getCurrentUser(): Promise<UserMe> {
  const res = await apiClient.get<ApiResponse<UserMe>>("/users/me");
  return res.data.data;
}

export async function getUserContext(): Promise<UserMeContext> {
  const res = await apiClient.get<ApiResponse<UserMeContext>>("/users/me/context");
  return res.data.data;
}

export async function updateCurrentUser(
  payload: UserMeUpdate,
): Promise<{ data: UserMe; message: string }> {
  const res = await apiClient.patch<ApiResponse<UserMe>>("/users/me", payload);
  return { data: res.data.data, message: res.data.message };
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<string> {
  const res = await apiClient.patch<ApiResponse<null>>(
    "/users/me/password",
    payload,
  );
  return res.data.message;
}
