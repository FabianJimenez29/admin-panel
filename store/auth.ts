import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  rol: string;
  nombre?: string;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userData') || 'null') : null,
  
  setAuth: (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(user));
    set({ token, user });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    set({ token: null, user: null });
    window.location.replace('/login');
  },
  
  isAuthenticated: () => {
    const state = get();
    return !!state.token && !!state.user;
  },
}));
