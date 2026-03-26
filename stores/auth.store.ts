import { create } from "zustand";

import { authService } from "@/services/auth/auth.service";

type AuthState = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
  hydrate: () => {
    const session = authService.getInitialSession();
    set({ isAuthenticated: session.isAuthenticated });
  },
}));
