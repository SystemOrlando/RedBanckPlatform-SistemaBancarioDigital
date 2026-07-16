// Tipos espejo de los DTOs del backend RedBanck (com.redbanck.api)

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserDto;
}

export type AccountType = 'SAVINGS' | 'CHECKING';
export type AccountStatus = 'ACTIVE' | 'CLOSED';

export interface AccountDto {
  id: string;
  accountNumber: string;
  maskedNumber: string;
  alias: string;
  type: AccountType;
  currency: string;
  balance: number;
  status: AccountStatus;
  createdAt: string;
}

export type TransactionType = 'DEPOSIT' | 'TRANSFER_IN' | 'TRANSFER_OUT';

export interface TransactionDto {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string | null;
  counterpartyAccountNumber: string | null;
  counterpartyName: string | null;
  reference: string;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface TransferReceipt {
  reference: string;
  amount: number;
  sourceAccount: string;
  destinationAccount: string;
  destinationHolder: string;
  createdAt: string;
}

export type CardStatus = 'ACTIVE' | 'BLOCKED';

export interface CardDto {
  id: string;
  accountId: string;
  maskedNumber: string;
  expiration: string;
  status: CardStatus;
  expired: boolean;
  createdAt: string;
}

export interface RevealedCardDto {
  id: string;
  cardNumber: string;
  cvv: string;
  expiration: string;
}

export interface LimitsDto {
  maxPerTransfer: number;
  dailyTransferLimit: number;
  monthlyTransferLimit: number;
  maxPerTransferCap: number;
  dailyCap: number;
  monthlyCap: number;
}

export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface AdminUserDto {
  id: string;
  documentId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: UserStatus;
  createdAt: string;
}

export interface MetricsDto {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalAccounts: number;
  totalBalance: number;
  transfersToday: number;
  volumeToday: number;
}

export interface ApiError {
  timestamp: string;
  status: number;
  message: string;
  fieldErrors: Record<string, string> | null;
}
