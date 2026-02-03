import { createClient } from '@supabase/supabase-js';

// Next.js 환경 변수는 빌드 시점에 주입되므로 직접 사용
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 인증 관련
export const APP_PASSWORD = '0213'; // 간단하게 하드코딩

export const checkPassword = (inputPassword: string): boolean => {
    return inputPassword === APP_PASSWORD;
};

export const setAuthSession = () => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('comcard_auth', 'true'); // sessionStorage에서 localStorage로 변경
    }
};

export const getAuthSession = (): boolean => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('comcard_auth') === 'true'; // sessionStorage에서 localStorage로 변경
    }
    return false;
};

export const clearAuthSession = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('comcard_auth'); // sessionStorage에서 localStorage로 변경
    }
};
