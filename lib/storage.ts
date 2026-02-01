import { Expense } from '@/types/expense';

const STORAGE_KEY = 'expense-tracker-data';

export const storage = {
  getExpenses: (): Expense[] => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveExpenses: (expenses: Expense[]): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  addExpense: (expense: Expense): Expense[] => {
    const expenses = storage.getExpenses();
    const newExpenses = [expense, ...expenses];
    storage.saveExpenses(newExpenses);
    return newExpenses;
  },

  updateExpense: (id: string, updatedExpense: Expense): Expense[] => {
    const expenses = storage.getExpenses();
    const newExpenses = expenses.map((exp) =>
      exp.id === id ? updatedExpense : exp
    );
    storage.saveExpenses(newExpenses);
    return newExpenses;
  },

  deleteExpense: (id: string): Expense[] => {
    const expenses = storage.getExpenses();
    const newExpenses = expenses.filter((exp) => exp.id !== id);
    storage.saveExpenses(newExpenses);
    return newExpenses;
  },

  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};
