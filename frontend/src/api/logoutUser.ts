import type { ApiResponse } from "../types/api";
import { refreshClient } from "./refreshClient";

export async function logoutUser(refreshToken: string): Promise<void> {
  await refreshClient.post<ApiResponse<null>>("/auth/logout", {
    refresh_token: refreshToken,
  });
}
