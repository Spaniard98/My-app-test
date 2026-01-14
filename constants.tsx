
import { Category, Account } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  // Expenses
  { id: '1', name: 'Продукты', icon: 'ShoppingBasket', color: '#3b82f6', type: 'expense' },
  { id: '2', name: 'Транспорт', icon: 'Bus', color: '#f59e0b', type: 'expense' },
  { id: '3', name: 'Досуг', icon: 'Ticket', color: '#ec4899', type: 'expense' },
  { id: '4', name: 'Ресторан', icon: 'Utensils', color: '#6366f1', type: 'expense' },
  { id: '5', name: 'Здоровье', icon: 'Heart', color: '#10b981', type: 'expense' },
  { id: '6', name: 'Подарки', icon: 'Gift', color: '#ef4444', type: 'expense' },
  { id: '7', name: 'Семья', icon: 'Smile', color: '#a855f7', type: 'expense' },
  { id: '8', name: 'Покупки', icon: 'ShoppingBag', color: '#94a3b8', type: 'expense' },
  { id: '9', name: 'Питомцы', icon: 'PawPrint', color: '#f97316', type: 'expense' },
  { id: '10', name: 'Образование', icon: 'GraduationCap', color: '#94a3b8', type: 'expense' },
  { id: '11', name: 'Путешествия', icon: 'Plane', color: '#14b8a6', type: 'expense' },
  { id: '12', name: 'Еще...', icon: 'ChevronDown', color: '#94a3b8', type: 'expense' },
  
  // Incomes
  { id: '13', name: 'Зарплата', icon: 'Wallet', color: '#22c55e', type: 'income' },
  { id: '14', name: 'Бонус', icon: 'TrendingUp', color: '#0ea5e9', type: 'income' },
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 'acc1', name: 'Карта', balance: 1423.00, icon: 'CreditCard', color: '#6366f1', type: 'regular' },
  { id: 'acc2', name: 'Наличные', balance: 0.00, icon: 'Wallet', color: '#10b981', type: 'regular' },
];

export const CURRENCY = '₽';
