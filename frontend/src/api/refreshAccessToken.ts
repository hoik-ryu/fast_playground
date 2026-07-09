import type { ApiResponse } from "../types/api";
import type { LoginTokens } from "../types/auth";
import { refreshClient } from "./refreshClient";

export async function refreshAccessToken(
  refreshToken: string,
): Promise<LoginTokens> {
  const res = await refreshClient.post<ApiResponse<LoginTokens>>(
    "/auth/refresh",
    { refresh_token: refreshToken },
  );
  return res.data.data;
}
