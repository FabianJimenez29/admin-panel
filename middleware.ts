import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const isAuthRoute = request.nextUrl.pathname === '/login';
  const isDashboardRoute = request.nextUrl.pathname === '/dashboard' || request.nextUrl.pathname.startsWith('/dashboard/');
  
  // Si no hay token y está intentando acceder al dashboard
  if (!token && isDashboardRoute) {
    console.log('No hay token, redirigiendo a login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si hay token y está intentando acceder al login
  if (token && isAuthRoute) {
    console.log('Token encontrado, redirigiendo a dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
