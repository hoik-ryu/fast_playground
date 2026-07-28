const DEFAULT_API_TIMEOUT_MS = 15_000;

function parseTimeoutMs(value: string | undefined): number {
  if (!value?.trim()) {
    return DEFAULT_API_TIMEOUT_MS;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_API_TIMEOUT_MS;
  }

  return parsed;
}

/** apiClient / refreshClient 공통 timeout (ms). 기본 15초 */
export const API_TIMEOUT_MS = parseTimeoutMs(import.meta.env.VITE_API_TIMEOUT);
