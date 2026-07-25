import { clearTokens, setTokens } from './tokenStorage';

export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';
export const AUTH_TOKENS_UPDATED_EVENT = 'auth:tokens-updated';

export function saveTokens(accessToken: string, refreshToken: string) {
  setTokens(accessToken, refreshToken);
  window.dispatchEvent(new Event(AUTH_TOKENS_UPDATED_EVENT));
}

export function clearAuthStorage() {
  clearTokens();
}

export function notifySessionExpired() {
  clearTokens();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

export function notifyTokensUpdated() {
  window.dispatchEvent(new Event(AUTH_TOKENS_UPDATED_EVENT));
}
