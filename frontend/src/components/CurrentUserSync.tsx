import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { useCurrentUserActions } from "../hooks/useCurrentUser";

// 토큰 상태와 /users/me 전역 유저 상태를 동기화합니다.
export default function CurrentUserSync() {
  const { token } = useAuth();
  const { fetchUser, clearUser } = useCurrentUserActions();

  useEffect(() => {
    if (token) {
      void fetchUser();
      return;
    }

    clearUser();
  }, [token, fetchUser, clearUser]);

  return null;
}
