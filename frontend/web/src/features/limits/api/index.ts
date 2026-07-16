import { api } from '../../../services/api';
import type { LimitsDto } from '../../../types/api';

export const getLimits = async (): Promise<LimitsDto> => {
  const { data } = await api.get<LimitsDto>('/limits');
  return data;
};

export const updateLimits = async (
  maxPerTransfer: number,
  dailyTransferLimit: number,
  monthlyTransferLimit: number
): Promise<LimitsDto> => {
  const { data } = await api.put<LimitsDto>('/limits', {
    maxPerTransfer,
    dailyTransferLimit,
    monthlyTransferLimit,
  });
  return data;
};
