import { api } from '../../../services/api';
import type { TransferReceipt } from '../../../types/api';

export interface TransferPayload {
  sourceAccountId: string;
  destinationAccountNumber: string;
  amount: number;
  description?: string;
}

export const createTransfer = async (payload: TransferPayload): Promise<TransferReceipt> => {
  const { data } = await api.post<TransferReceipt>('/transfers', payload);
  return data;
};
