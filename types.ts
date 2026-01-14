
export type TransactionType = 'expense' | 'income' | 'transfer' | 'adjustment';
export type AccountType = 'regular' | 'savings' | 'debt';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
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
  categoryId: string; // "transfer" для переводов
  accountId: string;  // Откуда
  toAccountId?: string; // Куда (для переводов)
  date: string;
  note?: string;
  type: TransactionType;
}

export interface AppState {
  version: number;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
}

export enum View {
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  ACCOUNTS = 'accounts',
  PLANNING = 'planning'
}
