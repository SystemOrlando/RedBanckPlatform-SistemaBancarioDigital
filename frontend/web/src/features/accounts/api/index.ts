import { api } from '../../../services/api';
import type { AccountDto, AccountType } from '../../../types/api';

export const listAccounts = async (): Promise<AccountDto[]> => {
  const { data } = await api.get<AccountDto[]>('/accounts');
  return data;
};

export const getAccount = async (id: string): Promise<AccountDto> => {
  const { data } = await api.get<AccountDto>(`/accounts/${id}`);
  return data;
};

export const openAccount = async (alias: string, type: AccountType): Promise<AccountDto> => {
  const { data } = await api.post<AccountDto>('/accounts', { alias, type });
  return data;
};
