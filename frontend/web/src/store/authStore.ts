import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '../types/api';

export type User = UserDto;

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      logout: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'redbanck-auth',
      // v1: sesiones previas a la integración con la API real (tokens de
      // prueba sin refreshToken) se descartan para forzar un login limpio.
      version: 1,
      migrate: () => ({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      }),
    }
  )
);
