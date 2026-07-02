import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// 로그인 안 된 상태면 /login 으로 보냅니다.
// 지금은 로그인 준비 단계라, 실제로 막고 싶지 않으면 App.tsx 에서
// 이 래퍼로 감싸지 않으면 됩니다.
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
