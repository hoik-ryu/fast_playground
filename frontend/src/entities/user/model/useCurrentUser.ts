import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_TOKENS_UPDATED_EVENT,
  getAccessToken,
} from '@shared/lib/session';

import { userKeys } from '../api/queryKeys';
import { getCurrentUser } from '../api/userApi';

const ADMIN_ROLE_NAME = 'admin';

function useHasAccessToken() {
  const [hasToken, setHasToken] = useState(() => Boolean(getAccessToken()));

  useEffect(() => {
    const sync = () => setHasToken(Boolean(getAccessToken()));

    window.addEventListener('storage', sync);
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, sync);
    window.addEventListener(AUTH_TOKENS_UPDATED_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, sync);
      window.removeEventListener(AUTH_TOKENS_UPDATED_EVENT, sync);
    };
  }, []);

  return hasToken;
}

export function useCurrentUser(options?: { enabled?: boolean }) {
  const hasToken = useHasAccessToken();
  const enabled = options?.enabled ?? hasToken;

  const query = useQuery({
    queryKey: userKeys.me(),
    queryFn: getCurrentUser,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const user = query.data ?? null;
  const isAdmin = user?.roles.some((role) => role.name === ADMIN_ROLE_NAME) ?? false;

  return {
    user,
    loading: query.isLoading,
    error: query.error,
    isAdmin,
    isAuthenticated: enabled && user !== null,
    refetch: query.refetch,
  };
}

export function useHasRole(roleName: string): boolean {
  const { user } = useCurrentUser();
  return user?.roles.some((role) => role.name === roleName) ?? false;
}
