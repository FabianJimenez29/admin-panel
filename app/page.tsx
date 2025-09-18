'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { forceRedirectToLogin, forceRedirectToDashboard } from '@/lib/navigation';

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      console.log('Página principal - Verificando autenticación...');
      
      // Pequeño delay para asegurar que el estado esté listo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!isAuthenticated()) {
        console.log('Página principal - No autenticado, redirigiendo al login');
        forceRedirectToLogin();
      } else {
        // Si está autenticado y es superAdmin, ir al dashboard
        if (user?.rol === 'superAdmin') {
          console.log('Página principal - Usuario autenticado, redirigiendo al dashboard');
          forceRedirectToDashboard();
        } else {
          // Si no es superAdmin, ir al login
          console.log('Página principal - Usuario no es superAdmin, redirigiendo al login');
          forceRedirectToLogin();
        }
      }
    };

    checkAuthAndRedirect();
  }, [isAuthenticated, user]);

  // Mostramos un loading mientras se realiza la redirección
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Verificando autenticación...</p>
      </div>
    </div>
  );
}
