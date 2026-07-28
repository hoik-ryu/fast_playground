import { useNavigate } from 'react-router-dom';

import { ROUTE_PATH } from '@app/router/route-path';
import { AppIcon } from '@shared/ui/icon';

/**
 * URL 매칭 실패(404) 시 표시하는 독립 화면.
 * React Runtime Error 안전망인 ErrorFallback 과는 책임이 분리됩니다.
 * (에러 객체 / resetErrorBoundary / 재시도 개념 없음, 네비게이션 액션만 제공)
 */
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-5xl font-bold tracking-tight text-indigo-600">404</p>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">페이지를 찾을 수 없습니다.</h1>
        <p className="mt-2 text-sm text-slate-500">
          요청하신 주소가 존재하지 않거나 이동되었을 수 있습니다.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            이전 페이지
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTE_PATH.HOME)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <AppIcon name="home" />
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
}
