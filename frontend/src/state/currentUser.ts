import { atom, selector } from "recoil";
import type { UserMe } from "../types/auth";

export const currentUserState = atom<UserMe | null>({
  key: "currentUserState",
  default: null,
});

export const currentUserLoadingState = atom<boolean>({
  key: "currentUserLoadingState",
  default: false,
});

export const isAdminSelector = selector({
  key: "isAdminSelector",
  get: ({ get }) => {
    const user = get(currentUserState);
    return user?.roles.some((role) => role.name === "admin") ?? false;
  },
});
