import { useRecoilCallback, useRecoilValue } from "recoil";
import { getCurrentUser } from "../api/users";
import { getAccessToken } from "../auth/storage";
import {
  currentUserLoadingState,
  currentUserState,
  isAdminSelector,
} from "../state/currentUser";

export function useCurrentUser() {
  const user = useRecoilValue(currentUserState);
  const loading = useRecoilValue(currentUserLoadingState);
  const isAdmin = useRecoilValue(isAdminSelector);

  return {
    user,
    loading,
    isAdmin,
    isAuthenticated: user !== null,
  };
}

export function useHasRole(roleName: string): boolean {
  const user = useRecoilValue(currentUserState);
  return user?.roles.some((role) => role.name === roleName) ?? false;
}

export function useCurrentUserActions() {
  const fetchUser = useRecoilCallback(
    ({ set, reset }) =>
      async () => {
        if (!getAccessToken()) {
          reset(currentUserState);
          return;
        }

        set(currentUserLoadingState, true);
        try {
          const user = await getCurrentUser();
          set(currentUserState, user);
        } catch {
          reset(currentUserState);
        } finally {
          set(currentUserLoadingState, false);
        }
      },
    [],
  );

  const clearUser = useRecoilCallback(
    ({ reset }) =>
      () => {
        reset(currentUserState);
        reset(currentUserLoadingState);
      },
    [],
  );

  return { fetchUser, clearUser };
}
