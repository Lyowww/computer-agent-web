import { create } from "zustand";
import type { User } from "@/lib/types";
import {
  clearAccessToken,
  getAccessToken,
  getStoredUserJson,
  setAccessToken,
  setStoredUserJson,
} from "@/lib/auth/token";

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  hydrate: () => {
    const token = getAccessToken();
    const raw = getStoredUserJson();
    let user: User | null = null;
    if (raw) {
      try {
        user = JSON.parse(raw) as User;
      } catch {
        user = null;
      }
    }
    set({ token, user, hydrated: true });
  },
  setSession: (user, token) => {
    setAccessToken(token);
    setStoredUserJson(JSON.stringify(user));
    set({ user, token, hydrated: true });
  },
  clearSession: () => {
    clearAccessToken();
    set({ user: null, token: null, hydrated: true });
  },
}));
