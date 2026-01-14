
import { AppState } from './types';
import { INITIAL_CATEGORIES, INITIAL_ACCOUNTS } from './constants';

const STORAGE_KEY = 'money_tracker_state_v1';

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
};

export const loadState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return getInitialState();
    
    const parsed = JSON.parse(saved);
    // Простая миграция, если понадобится
    if (parsed.version < 1) return getInitialState();
    
    return parsed;
  } catch (e) {
    return getInitialState();
  }
};

export const getInitialState = (): AppState => ({
  version: 1,
  accounts: INITIAL_ACCOUNTS,
  categories: INITIAL_CATEGORIES,
  transactions: []
});
