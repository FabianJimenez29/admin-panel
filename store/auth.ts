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
    console.log('Logout - Limpiando datos y redirigiendo');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    // Limpiar cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    set({ token: null, user: null });
    // Redirección inmediata
    window.location.href = '/login';
  },
  
  isAuthenticated: () => {
    const state = get();
    const result = !!state.token && !!state.user;
    console.log('Auth check - Token:', !!state.token, 'User:', !!state.user, 'Result:', result);
    return result;
  },
}));
