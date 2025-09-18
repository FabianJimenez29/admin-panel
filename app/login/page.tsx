'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Iniciando login...');
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      // Validar que tenemos los datos necesarios
      if (!data.token || !data.user) {
        throw new Error('Respuesta del servidor incompleta');
      }

      if (data.user?.rol !== 'superAdmin') {
        toast.error('Acceso no autorizado - Solo SuperAdmin');
        return;
      }

      // Guardar datos en el store
      // Validar datos del usuario antes de redirigir
      if (
        data.user &&
        typeof data.user.id === 'number' &&
        typeof data.user.email === 'string' &&
        data.user.rol === 'superAdmin'
      ) {
        // Guardar en el store
        setAuth(data.token, data.user);
        
        // Guardar token en cookies
        const cookieExpiry = new Date();
        cookieExpiry.setDate(cookieExpiry.getDate() + 7); // 7 días
        document.cookie = `token=${data.token}; path=/; expires=${cookieExpiry.toUTCString()}; SameSite=Lax`;
        
        toast.success('Login exitoso');
        console.log('Login exitoso - Redirigiendo al dashboard');
        
        // Redirección directa e inmediata
        window.location.href = '/dashboard';
      } else {
        toast.error('Datos de usuario inválidos o rol incorrecto');
      }

    } catch (error: unknown) {
      console.error('Error en login:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error de conexión con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Panel de Super Administrador
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acceso exclusivo para super administradores
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}