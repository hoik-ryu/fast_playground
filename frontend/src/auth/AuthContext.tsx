import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

// 로그인 붙일 준비용 아주 단순한 인증 컨텍스트.
// 지금은 토큰을 localStorage 에 넣고 로그인 여부만 관리합니다.
// 나중에 실제 로그인 API가 생기면 login() 내부만 교체하면 됩니다.

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("access_token"),
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login: (newToken: string) => setToken(newToken),
      logout: () => setToken(null),
    }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 는 AuthProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}
