
export type TransactionType = 'expense' | 'income' | 'transfer';
export type AccountType = 'regular' | 'savings' | 'debt';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  icon: string;
  color: string;
  type: AccountType;
}

export interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // For transfers
  date: string;
  note?: string;
  type: TransactionType;
}

export interface Budget {
  categoryId: string;
  limit: number;
  period: 'month' | 'week';
}

export enum View {
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  ACCOUNTS = 'accounts',
  PLANNING = 'planning'
}
