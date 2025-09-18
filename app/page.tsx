'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Siempre redirigir al login primero para verificar autenticación
    if (!isAuthenticated()) {
      router.replace('/login');
    } else {
      // Si está autenticado y es superAdmin, ir al dashboard
      if (user?.rol === 'superAdmin') {
        router.replace('/dashboard');
      } else {
        // Si no es superAdmin, cerrar sesión y ir al login
        router.replace('/login');
      }
    }
  }, [isAuthenticated, user, router]);

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
