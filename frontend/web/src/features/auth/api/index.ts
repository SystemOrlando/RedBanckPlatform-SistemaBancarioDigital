import { api } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import type { AuthResponse, UserDto } from '../../../types/api';
import type { LoginFormValues, RegisterFormValues } from '../schemas';

export const login = async (values: LoginFormValues): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', values);
  useAuthStore.getState().login(data.user, data.accessToken, data.refreshToken);
  return data;
};

export const register = async (values: RegisterFormValues): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/register', values);
  useAuthStore.getState().login(data.user, data.accessToken, data.refreshToken);
  return data;
};

/** Revoca el refresh token en el servidor y limpia la sesión local. */
export const logout = async (): Promise<void> => {
  const { refreshToken } = useAuthStore.getState();
  try {
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  } finally {
    useAuthStore.getState().logout();
  }
};

export const getProfile = async (): Promise<UserDto> => {
  const { data } = await api.get<UserDto>('/users/me');
  return data;
};
