import { clearAuthStorage } from '@shared/lib/session';

import { queryClient } from './queryClient';

export type ApiMode = 'dev' | 'real';

const API_MODE_STORAGE_KEY = 'api-mode';

const DEFAULT_DEV_API_BASE_URL = 'http://localhost:8000';
const DEFAULT_REAL_API_BASE_URL = 'https://api.example.com';

function isApiMode(value: string | null): value is ApiMode {
  return value === 'dev' || value === 'real';
}

function resolveBaseUrl(mode: ApiMode): string {
  if (mode === 'dev') {
    return import.meta.env.VITE_DEV_API_BASE_URL?.trim() || DEFAULT_DEV_API_BASE_URL;
  }

  return import.meta.env.VITE_REAL_API_BASE_URL?.trim() || DEFAULT_REAL_API_BASE_URL;
}

/** 현재 API mode. 운영 빌드에서는 항상 real. */
export function getApiMode(): ApiMode {
  if (!import.meta.env.DEV) {
    return 'real';
  }

  const stored = localStorage.getItem(API_MODE_STORAGE_KEY);
  if (isApiMode(stored)) {
    return stored;
  }

  return 'dev';
}

/** 개발 환경에서만 localStorage 에 mode 저장. */
export function setApiMode(mode: ApiMode): void {
  if (!import.meta.env.DEV) {
    return;
  }

  localStorage.setItem(API_MODE_STORAGE_KEY, mode);
}

/** 현재 mode 에 해당하는 API baseURL. */
export function getCurrentApiBaseUrl(): string {
  return resolveBaseUrl(getApiMode());
}

/**
 * API mode 변경 + 세션/캐시 초기화 후 로그인 페이지로 이동.
 * 동일 mode 재선택은 no-op. logout API 는 호출하지 않음.
 */
export function changeApiMode(nextMode: ApiMode): void {
  if (!import.meta.env.DEV) {
    return;
  }

  if (getApiMode() === nextMode) {
    return;
  }

  setApiMode(nextMode);
  clearAuthStorage();
  queryClient.clear();
  window.location.replace('/login');
}
