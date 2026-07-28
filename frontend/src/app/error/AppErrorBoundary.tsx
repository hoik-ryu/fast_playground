import type { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { ErrorFallback } from './ErrorFallback';

type AppErrorBoundaryProps = {
  children: ReactNode;
  /** 값이 바뀌면 Error Boundary 상태를 리셋합니다. 기본은 빈 배열입니다. */
  resetKeys?: unknown[];
};

/**
 * React Runtime Error 전역 안전망.
 * Axios / Query / Auth / Toast 에러 처리는 건드리지 않습니다.
 *
 * 향후 Sentry 등 외부 로깅은 onError 안에서 확장하면 됩니다.
 */
function handleError(error: unknown, info: ErrorInfo) {
  // TODO: Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  console.error('[AppErrorBoundary]', error, info.componentStack);
}

export function AppErrorBoundary({ children, resetKeys = [] }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError} resetKeys={resetKeys}>
      {children}
    </ErrorBoundary>
  );
}
