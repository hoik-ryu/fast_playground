import { apiClient } from "./client";
import type { ApiResponse } from "../types/api";
import type { RegisterRequest, RegisterUserData } from "../types/auth";

export async function registerUser(
  payload: RegisterRequest,
): Promise<RegisterUserData> {
  const res = await apiClient.post<ApiResponse<RegisterUserData>>(
    "/auth/register",
    payload,
  );
  return res.data.data;
}
