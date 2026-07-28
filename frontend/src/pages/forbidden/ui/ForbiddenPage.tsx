import { useNavigate } from 'react-router-dom';

import { ROUTE_PATH } from '@app/router/route-path';
import { AppIcon } from '@shared/ui/icon';

/**
 * 인증은 되었으나 권한이 없는 경우(403) 표시하는 독립 화면.
 * - NotFoundPage(404, URL 없음) 와 구분됩니다.
 * - ErrorFallback(런타임 예외) 과도 구분됩니다.
 *   (에러 객체 / resetErrorBoundary / 재시도 개념 없음, 네비게이션 액션만 제공)
 *
 * 향후 RoleRoute / PermissionRoute 도입 시 권한 부족 fallback 으로 재사용합니다.
 */
export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-5xl font-bold tracking-tight text-indigo-600">403</p>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">접근 권한이 없습니다.</h1>
        <p className="mt-2 text-sm text-slate-500">이 페이지에 접근할 권한이 없습니다.</p>

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
