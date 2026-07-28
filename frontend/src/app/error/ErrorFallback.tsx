import type { FallbackProps } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';

import { ROUTE_PATH } from '../router';

export function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate(ROUTE_PATH.HOME);
    resetErrorBoundary();
  };

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">문제가 발생했습니다.</h1>
        <p className="mt-2 text-sm text-slate-500">잠시 후 다시 시도해주세요.</p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={resetErrorBoundary}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            다시 시도
          </button>
          <button
            type="button"
            onClick={handleGoHome}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
