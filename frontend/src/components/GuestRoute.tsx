import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../auth/storage";
import { useAuth } from "../auth/AuthContext";

// 이미 로그인된 사용자는 /login, /register 에 접근하지 못하게 합니다.
export default function GuestRoute() {
  const { isAuthenticated } = useAuth();
  const hasToken = isAuthenticated || Boolean(getAccessToken());

  if (hasToken) {
    return <Navigate to="/items" replace />;
  }

  return <Outlet />;
}
