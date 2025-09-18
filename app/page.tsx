'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // DIRECTAMENTE al login SIN verificaciones
    window.location.replace('/login');
  }, []);

  return null;
}
