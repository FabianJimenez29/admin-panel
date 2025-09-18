import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;
  
  console.log('Middleware - Pathname:', pathname);
  console.log('Middleware - Token exists:', !!token);
  
  // Si está en la página principal sin token, redirigir al login
  if (pathname === '/' && !token) {
    console.log('Página principal sin token, redirigiendo a login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Si está en la página principal con token, redirigir al dashboard
  if (pathname === '/' && token) {
    console.log('Página principal con token, redirigiendo a dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Si no hay token y está intentando acceder al dashboard
  if (!token && pathname.startsWith('/dashboard')) {
    console.log('Dashboard sin token, redirigiendo a login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si hay token y está intentando acceder al login
  if (token && pathname === '/login') {
    console.log('Login con token, redirigiendo a dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login'],
};
