'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { forceRedirectToLogin } from '@/lib/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('ProtectedRoute - Verificando autenticación...');
      
      // Pequeño delay para asegurar que el estado esté listo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!isAuthenticated()) {
        console.log('ProtectedRoute - Usuario no autenticado, redirigiendo al login');
        forceRedirectToLogin();
        return;
      }

      if (user?.rol !== 'superAdmin') {
        console.log('ProtectedRoute - Usuario no es superAdmin, cerrando sesión');
        logout();
        return;
      }

      // Si llega aquí, está autenticado y es superAdmin
      console.log('ProtectedRoute - Usuario autenticado correctamente');
      setShouldRender(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, user, logout]);

  if (isLoading || !shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}