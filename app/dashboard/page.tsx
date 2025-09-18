'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import EnvInfo from '@/components/EnvInfo';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <EnvInfo />
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Bienvenido al Panel de SuperAdmin</h2>
                <p className="text-gray-600">
                  Usuario: {user?.email}
                </p>
                <p className="text-gray-600">
                  Rol: {user?.rol}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}