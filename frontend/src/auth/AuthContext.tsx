import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_TOKENS_UPDATED_EVENT,
  clearAuthStorage,
  getAccessToken,
  saveTokens,
} from "./storage";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAccessToken());

  const login = useCallback((accessToken: string, refreshToken: string) => {
    saveTokens(accessToken, refreshToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setToken(null);
  }, []);

  // 다른 탭에서 로그아웃했거나 storage 가 비워진 경우 동기화
  useEffect(() => {
    const syncFromStorage = () => {
      setToken(getAccessToken());
    };

    const handleSessionExpired = () => {
      setToken(null);
    };

    const handleTokensUpdated = () => {
      setToken(getAccessToken());
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    window.addEventListener(AUTH_TOKENS_UPDATED_EVENT, handleTokensUpdated);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired,
      );
      window.removeEventListener(
        AUTH_TOKENS_UPDATED_EVENT,
        handleTokensUpdated,
      );
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, login, logout],
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
