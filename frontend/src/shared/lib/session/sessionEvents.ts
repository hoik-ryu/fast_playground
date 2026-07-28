import { clearTokens, setTokens } from './tokenStorage';

export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';
export const AUTH_TOKENS_UPDATED_EVENT = 'auth:tokens-updated';

/** 동시 401 등에서 세션 종료 처리(토큰 삭제·이벤트·redirect/toast)를 1회로 제한 */
let isHandlingSessionExpired = false;

export function saveTokens(accessToken: string, refreshToken: string) {
  isHandlingSessionExpired = false;
  setTokens(accessToken, refreshToken);
  window.dispatchEvent(new Event(AUTH_TOKENS_UPDATED_EVENT));
}

export function clearAuthStorage() {
  isHandlingSessionExpired = false;
  clearTokens();
}

/**
 * 세션 만료 처리. 이미 처리 중이면 false.
 * @returns 이번 호출에서 실제로 만료 처리를 수행했는지
 */
export function notifySessionExpired(): boolean {
  if (isHandlingSessionExpired) {
    return false;
  }

  isHandlingSessionExpired = true;
  clearTokens();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
  return true;
}

export function notifyTokensUpdated() {
  window.dispatchEvent(new Event(AUTH_TOKENS_UPDATED_EVENT));
}
