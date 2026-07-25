import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@features/auth';
import { getAccessToken } from '@shared/lib/session';

// access_token 이 없으면 로그인 페이지로 보냅니다.
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const hasToken = isAuthenticated || Boolean(getAccessToken());

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
