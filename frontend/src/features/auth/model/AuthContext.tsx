import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { userKeys } from '@entities/user';
import { queryClient } from '@shared/api/queryClient';
import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_TOKENS_UPDATED_EVENT,
  clearAuthStorage,
  getAccessToken,
  saveTokens,
} from '@shared/lib/session';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function clearUserQueryCache() {
  queryClient.removeQueries({ queryKey: userKeys.all });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAccessToken());

  const login = useCallback((accessToken: string, refreshToken: string) => {
    saveTokens(accessToken, refreshToken);
    setToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    clearUserQueryCache();
    setToken(null);
  }, []);

  useEffect(() => {
    const syncFromStorage = () => {
      const nextToken = getAccessToken();
      setToken(nextToken);
      if (!nextToken) {
        clearUserQueryCache();
      }
    };

    const handleSessionExpired = () => {
      clearUserQueryCache();
      setToken(null);
    };

    const handleTokensUpdated = () => {
      setToken(getAccessToken());
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    window.addEventListener(AUTH_TOKENS_UPDATED_EVENT, handleTokensUpdated);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
      window.removeEventListener(AUTH_TOKENS_UPDATED_EVENT, handleTokensUpdated);
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth 는 AuthProvider 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
