import { Expense } from './types';
import { supabase } from './supabase';

const STORAGE_KEY = 'comcard_expenses_v1';
const TABLE_NAME = 'expenses';

// Supabase 연결 가능 여부 체크
// 현재는 localStorage만 사용 (Supabase 설정 후 true로 변경)
const isSupabaseConfigured = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    return url && key && url !== 'your-project-url' && url !== 'https://placeholder.supabase.co';
};

// =============== GET EXPENSES ===============
export const getExpenses = async (): Promise<Expense[]> => {
    if (typeof window === 'undefined') return [];

    // Supabase 사용
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                return getExpensesFromLocalStorage();
            }

            return data || [];
        } catch (e) {
            console.error('Failed to fetch from Supabase', e);
            return getExpensesFromLocalStorage();
        }
    }

    // Fallback to localStorage
    return getExpensesFromLocalStorage();
};

// LocalStorage에서 가져오기 (fallback)
const getExpensesFromLocalStorage = (): Expense[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored).sort((a: Expense, b: Expense) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    } catch (e) {
        console.error('Failed to parse expenses from localStorage', e);
        return [];
    }
};

// =============== SAVE EXPENSE ===============
export const saveExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
    const newExpense: Expense = {
        ...expenseData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
    };

    // Supabase 사용
    if (isSupabaseConfigured()) {
        try {
            const { error } = await supabase
                .from(TABLE_NAME)
                .insert([newExpense]);

            if (error) {
                console.error('Supabase insert error:', error);
                return saveExpenseToLocalStorage(newExpense);
            }

            return newExpense;
        } catch (e) {
            console.error('Failed to save to Supabase', e);
            return saveExpenseToLocalStorage(newExpense);
        }
    }

    // Fallback to localStorage
    return saveExpenseToLocalStorage(newExpense);
};

const saveExpenseToLocalStorage = (newExpense: Expense): Expense => {
    const expenses = getExpensesFromLocalStorage();
    const updated = [newExpense, ...expenses];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newExpense;
};

// =============== UPDATE EXPENSE ===============
export const updateExpense = async (updatedExpense: Expense): Promise<void> => {
    // Supabase 사용
    if (isSupabaseConfigured()) {
        try {
            const { error } = await supabase
                .from(TABLE_NAME)
                .update(updatedExpense)
                .eq('id', updatedExpense.id);

            if (error) {
                console.error('Supabase update error:', error);
                updateExpenseInLocalStorage(updatedExpense);
            }
        } catch (e) {
            console.error('Failed to update in Supabase', e);
            updateExpenseInLocalStorage(updatedExpense);
        }
        return;
    }

    // Fallback to localStorage
    updateExpenseInLocalStorage(updatedExpense);
};

const updateExpenseInLocalStorage = (updatedExpense: Expense): void => {
    const expenses = getExpensesFromLocalStorage();
    const index = expenses.findIndex(e => e.id === updatedExpense.id);
    if (index !== -1) {
        expenses[index] = updatedExpense;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
};

// =============== DELETE EXPENSE ===============
export const deleteExpense = async (id: string): Promise<void> => {
    // Supabase 사용
    if (isSupabaseConfigured()) {
        try {
            const { error } = await supabase
                .from(TABLE_NAME)
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Supabase delete error:', error);
                deleteExpenseFromLocalStorage(id);
            }
        } catch (e) {
            console.error('Failed to delete from Supabase', e);
            deleteExpenseFromLocalStorage(id);
        }
        return;
    }

    // Fallback to localStorage
    deleteExpenseFromLocalStorage(id);
};

const deleteExpenseFromLocalStorage = (id: string): void => {
    const expenses = getExpensesFromLocalStorage();
    const filtered = expenses.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
