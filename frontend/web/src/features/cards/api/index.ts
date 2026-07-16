import { api } from '../../../services/api';
import type { CardDto, RevealedCardDto } from '../../../types/api';

export const listCards = async (): Promise<CardDto[]> => {
  const { data } = await api.get<CardDto[]>('/cards');
  return data;
};

export const createCard = async (accountId: string): Promise<CardDto> => {
  const { data } = await api.post<CardDto>('/cards', { accountId });
  return data;
};

export const blockCard = async (id: string): Promise<CardDto> => {
  const { data } = await api.patch<CardDto>(`/cards/${id}/block`);
  return data;
};

export const unblockCard = async (id: string): Promise<CardDto> => {
  const { data } = await api.patch<CardDto>(`/cards/${id}/unblock`);
  return data;
};

/** Requiere reconfirmar la contraseña del usuario. */
export const revealCard = async (id: string, password: string): Promise<RevealedCardDto> => {
  const { data } = await api.post<RevealedCardDto>(`/cards/${id}/reveal`, { password });
  return data;
};
