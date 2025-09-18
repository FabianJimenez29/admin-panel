/**
 * Utilidades de navegación para forzar redirecciones
 */

export const forceRedirect = (path: string) => {
  console.log(`Forzando redirección a: ${path}`);
  
  // Método 1: window.location.href (más confiable)
  if (typeof window !== 'undefined') {
    window.location.href = path;
  }
};

export const forceRedirectToLogin = () => {
  forceRedirect('/login');
};

export const forceRedirectToDashboard = () => {
  forceRedirect('/dashboard');
};