import { api } from '../../../services/api';
import type { Page, TransactionDto, TransactionType } from '../../../types/api';

export interface TransactionFilters {
  accountId?: string;
  type?: TransactionType;
  /** Fecha ISO (yyyy-MM-dd), inclusive. */
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export const searchTransactions = async (
  filters: TransactionFilters = {}
): Promise<Page<TransactionDto>> => {
  const { data } = await api.get<Page<TransactionDto>>('/transactions', { params: filters });
  return data;
};
