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
    console.log('Logout - Limpiando datos de autenticación');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    // Limpiar también las cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    set({ token: null, user: null });
    // Redirigir al login inmediatamente
    console.log('Logout - Redirigiendo al login');
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
  },
  
  isAuthenticated: () => {
    const state = get();
    
    // Verificar estado del store
    const hasStoreAuth = !!state.token && !!state.user;
    
    // Verificar cookies en el lado del cliente
    let hasCookieToken = false;
    if (typeof window !== 'undefined') {
      hasCookieToken = document.cookie.split(';').some(cookie => 
        cookie.trim().startsWith('token=') && cookie.trim() !== 'token='
      );
    }
    
    console.log('Auth check - Store:', hasStoreAuth, 'Cookie:', hasCookieToken);
    
    // Debe tener ambos: estado del store Y cookie
    return hasStoreAuth && hasCookieToken;
  },
}));
