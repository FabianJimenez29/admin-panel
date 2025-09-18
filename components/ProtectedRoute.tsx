'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('ProtectedRoute - Verificando autenticación...');
    
    // Verificación simple y directa
    if (!isAuthenticated()) {
      console.log('ProtectedRoute - No autenticado, redirigiendo al login');
      window.location.href = '/login';
      return;
    }

    if (user?.rol !== 'superAdmin') {
      console.log('ProtectedRoute - No es superAdmin, cerrando sesión');
      logout();
      return;
    }

    // Si llega aquí, está autenticado y es superAdmin
    console.log('ProtectedRoute - Usuario válido, mostrando contenido');
    setIsLoading(false);
  }, [isAuthenticated, user, logout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}