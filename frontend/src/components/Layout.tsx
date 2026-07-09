import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/logoutUser";
import { useAuth } from "../auth/AuthContext";
import { getRefreshToken } from "../auth/storage";

const navItems = [
  { to: "/items", label: "Items" },
  { to: "/realtime", label: "Realtime" },
];

export default function Layout() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch {
      // 네트워크 오류·이미 폐기된 토큰이어도 클라이언트 세션은 정리
    } finally {
      logout();
      navigate("/login");
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <NavLink
            to="/"
            className="text-base font-bold tracking-tight text-slate-900"
          >
            FastAPI Playground
          </NavLink>

          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
              >
                {loggingOut ? "로그아웃 중..." : "로그아웃"}
              </button>
            ) : (
              <NavLink
                to="/login"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                로그인
              </NavLink>
            )}
          </div>
        </div>

        {/* 모바일 네비 */}
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
