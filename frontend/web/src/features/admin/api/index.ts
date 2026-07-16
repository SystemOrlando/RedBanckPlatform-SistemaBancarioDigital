import { api } from '../../../services/api';
import type { AdminUserDto, MetricsDto, Page } from '../../../types/api';

export const getMetrics = async (): Promise<MetricsDto> => {
  const { data } = await api.get<MetricsDto>('/admin/metrics');
  return data;
};

export const listUsers = async (page = 0, size = 20): Promise<Page<AdminUserDto>> => {
  const { data } = await api.get<Page<AdminUserDto>>('/admin/users', { params: { page, size } });
  return data;
};

export const blockUser = async (id: string): Promise<AdminUserDto> => {
  const { data } = await api.patch<AdminUserDto>(`/admin/users/${id}/block`);
  return data;
};

export const unblockUser = async (id: string): Promise<AdminUserDto> => {
  const { data } = await api.patch<AdminUserDto>(`/admin/users/${id}/unblock`);
  return data;
};
