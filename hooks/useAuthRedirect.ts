'use client';

import { useEffect } from 'react';

export function useAuthRedirect(isAuthenticated: boolean, targetPath: string) {
  useEffect(() => {
    if (isAuthenticated) {
      // Usar window.location para una redirección forzada
      window.location.href = targetPath;
    }
  }, [isAuthenticated, targetPath]);
}
