import { Expense } from './types';

const STORAGE_KEY = 'comcard_expenses_v1';

export const getExpenses = (): Expense[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored).sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
        console.error('Failed to parse expenses', e);
        return [];
    }
};

export const saveExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const expenses = getExpenses();
    const newExpense: Expense = {
        ...expenseData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
    };
    const updated = [newExpense, ...expenses];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newExpense;
};

export const updateExpense = (updatedExpense: Expense) => {
    const expenses = getExpenses();
    const index = expenses.findIndex(e => e.id === updatedExpense.id);
    if (index !== -1) {
        expenses[index] = updatedExpense;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
};

export const deleteExpense = (id: string) => {
    const expenses = getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
