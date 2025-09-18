'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // SIEMPRE redirigir al login sin verificaciones
    console.log('Página principal - Redirigiendo SIEMPRE al login');
    window.location.href = '/login';
  }, []);

  // Mostramos un loading mientras se realiza la redirección
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo al login...</p>
      </div>
    </div>
  );
}
