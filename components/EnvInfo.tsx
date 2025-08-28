"use client";

import { useEffect, useState } from 'react';

export default function EnvInfo() {
  const [backendUrl, setBackendUrl] = useState<string>('');
  
  useEffect(() => {
    // Solo se ejecuta en el cliente
    setBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL || 'No configurado');
  }, []);
  
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 text-sm text-blue-700">
      <h2 className="font-bold">Información de configuración</h2>
      <p>Backend URL: {backendUrl}</p>
      <p className="text-xs mt-1">Esta información se carga desde las variables de entorno (.env)</p>
    </div>
  );
}
