'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Solo verificar si NO está autenticado
    if (!isAuthenticated()) {
      window.location.replace('/login');
      return;
    }

    // Solo verificar si NO es superAdmin
    if (user?.rol !== 'superAdmin') {
      // Limpiar datos y ir al login
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.replace('/login');
      return;
    }

    // Si llegó aquí, todo está bien
    setIsLoading(false);
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}