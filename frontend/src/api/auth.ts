import { apiClient } from "./client";
import type { ApiResponse } from "../types/api";
import type {
  LoginRequest,
  LoginTokens,
  RegisterRequest,
  RegisterUserData,
} from "../types/auth";

export async function registerUser(
  payload: RegisterRequest,
): Promise<{ data: RegisterUserData; message: string }> {
  const res = await apiClient.post<ApiResponse<RegisterUserData>>(
    "/auth/register",
    payload,
  );
  return { data: res.data.data, message: res.data.message };
}

export async function loginUser(payload: LoginRequest): Promise<LoginTokens> {
  const res = await apiClient.post<ApiResponse<LoginTokens>>(
    "/auth/login",
    payload,
  );
  return res.data.data;
}
