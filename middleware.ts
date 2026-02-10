import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/nueva-visita',
  '/visitas',
  '/admin',
  '/captura',
  '/mis-visitas'
];

// Rutas públicas (accesibles sin autenticación)
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/health'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Obtener token de autenticación
  const token = request.cookies.get('auth_token')?.value;
  
  // Si no hay token y la ruta es protegida, redirigir a login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si hay token y el usuario intenta acceder a login/register, redirigir al inicio
  if (token && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Para rutas admin, verificar rol
  if (pathname.startsWith('/admin') && token) {
    try {
      // Decodificar token JWT (simplificado - en producción usaría una librería JWT)
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        
        // Verificar si el usuario es admin
        if (payload.role !== 'admin') {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
    } catch (error) {
      // Si hay error decodificando el token, redirigir a login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('error', 'invalid_token');
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};