import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // SOLO redirigir la página principal al login, NADA MÁS
  if (pathname === '/') {
    console.log('Página principal - Redirigiendo al login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Dejar pasar TODO lo demás sin verificaciones
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
