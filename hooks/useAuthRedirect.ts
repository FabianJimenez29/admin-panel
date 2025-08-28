'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthRedirect(isAuthenticated: boolean, targetPath: string) {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      // Usar window.location para una redirección forzada
      window.location.href = targetPath;
    }
  }, [isAuthenticated, targetPath]);
}
