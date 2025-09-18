import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token');
  
  console.log('Middleware - Pathname:', pathname);
  
  // SIEMPRE redirigir la página principal al login
  if (pathname === '/') {
    console.log('Página principal - Redirigiendo SIEMPRE al login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Proteger rutas del dashboard - requieren token
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log('Dashboard sin token - Redirigiendo al login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Si hay token válido y está en login, ir al dashboard
  if (token && pathname === '/login') {
    console.log('Login con token válido - Redirigiendo al dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login'],
};
