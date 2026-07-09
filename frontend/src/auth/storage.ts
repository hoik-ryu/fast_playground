export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";
export const AUTH_TOKENS_UPDATED_EVENT = "auth:tokens-updated";

export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  window.dispatchEvent(new Event(AUTH_TOKENS_UPDATED_EVENT));
}

export function clearAuthStorage() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function notifySessionExpired() {
  clearAuthStorage();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}
