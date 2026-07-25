import { refreshClient } from './refreshClient';
import type { ApiResponse } from './types';

/** POST /auth/refresh 응답 data — 도메인 중립 HTTP 인프라 타입 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
  const res = await refreshClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return res.data.data;
}
