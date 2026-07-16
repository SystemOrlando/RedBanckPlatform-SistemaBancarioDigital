import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';
import type { ApiError, AuthResponse } from '../types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el JWT a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Renovación automática de sesión -----------------------------------
// Ante un 401, intenta renovar con el refresh token (una sola renovación en
// vuelo; las demás peticiones esperan) y reintenta la petición original.
// Si la renovación falla, se cierra la sesión.

let refreshPromise: Promise<string> | null = null;

const refreshSession = async (): Promise<string> => {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) throw new Error('Sin refresh token');
  // Cliente sin interceptores para evitar recursión
  const { data } = await axios.post<AuthResponse>(`${API_URL}/auth/refresh`, { refreshToken });
  useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
};

const forceLogout = () => {
  useAuthStore.getState().logout();
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
    const isAuthCall = original?.url?.includes('/auth/');

    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        refreshPromise = refreshPromise ?? refreshSession();
        const newToken = await refreshPromise;
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        forceLogout();
      } finally {
        refreshPromise = null;
      }
    }
    return Promise.reject(error);
  }
);

/** Extrae un mensaje legible del error de la API (formato ApiError del backend). */
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    if (data?.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
      return Object.values(data.fieldErrors)[0];
    }
    if (data?.message) return data.message;
    if (error.code === 'ERR_NETWORK') return 'No se pudo conectar con el servidor';
  }
  return 'Ocurrió un error inesperado';
};
