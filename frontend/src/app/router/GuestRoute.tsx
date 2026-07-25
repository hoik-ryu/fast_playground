import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@features/auth';
import { getAccessToken } from '@shared/lib/session';

// 이미 로그인된 사용자는 /login, /register 에 접근하지 못하게 합니다.
export function GuestRoute() {
  const { isAuthenticated } = useAuth();
  const hasToken = isAuthenticated || Boolean(getAccessToken());

  if (hasToken) {
    return <Navigate to="/items" replace />;
  }

  return <Outlet />;
}
