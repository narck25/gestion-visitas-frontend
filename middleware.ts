import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ESTRATEGIA DE PROTECCIÓN BASADA EN PATRONES
 * 
 * En lugar de mantener una lista estática de rutas protegidas,
 * definimos patrones de rutas que requieren autenticación.
 * Esto hace el sistema más mantenible y escalable.
 */

// ==================== CONFIGURACIÓN DE RUTAS ====================

/**
 * Rutas públicas explícitas (accesibles sin autenticación)
 * Estas son las únicas rutas que no requieren token
 */
const PUBLIC_ROUTES = [
  '/',                    // Página principal (puede tener login integrado)
  '/auth/login',          // Página de login
  '/auth/register',       // Página de registro
  '/health',              // Health check
  '/unauthorized',        // Página de acceso no autorizado
];

/**
 * Patrones de rutas que requieren autenticación
 * Se evalúan en orden de prioridad
 * 
 * Nota: Los patrones más específicos deben ir primero
 * 
 * ROLES VÁLIDOS EN BASE DE DATOS:
 * - ADMIN
 * - SUPERVISOR
 * - PROMOTER (nota: en código anterior se usaba PROMOTOR, corregir a PROMOTER)
 * - SUPER_ADMIN
 * - VIEWER
 */
const PROTECTED_PATTERNS = [
  // ========== RUTAS DE ADMINISTRACIÓN (ADMIN y SUPER_ADMIN) ==========
  { pattern: '/admin', requiredRole: ['ADMIN', 'SUPER_ADMIN'] },
  
  // ========== RUTAS DE SUPERVISOR (SUPERVISOR, ADMIN o SUPER_ADMIN) ==========
  { pattern: '/supervisor', requiredRole: ['SUPERVISOR', 'ADMIN', 'SUPER_ADMIN'] },
  
  // ========== RUTAS DE GESTIÓN DE CLIENTES ==========
  // Crear cliente (ADMIN, SUPERVISOR o SUPER_ADMIN)
  { pattern: '/clientes/crear', requiredRole: ['ADMIN', 'SUPERVISOR', 'SUPER_ADMIN'] },
  // Editar cliente (ADMIN, SUPERVISOR o SUPER_ADMIN)
  { pattern: '/clientes/editar', requiredRole: ['ADMIN', 'SUPERVISOR', 'SUPER_ADMIN'] },
  // Listar clientes (ADMIN, SUPERVISOR, PROMOTER, SUPER_ADMIN, VIEWER)
  { pattern: '/clientes', requiredRole: ['ADMIN', 'SUPERVISOR', 'PROMOTER', 'SUPER_ADMIN', 'VIEWER'] },
  
  // ========== RUTAS DE VISITAS ==========
  // Detalle de visita específica (PROMOTER o superior, VIEWER para solo lectura)
  { pattern: '/visitas/', requiredRole: ['ADMIN', 'SUPERVISOR', 'PROMOTER', 'SUPER_ADMIN', 'VIEWER'] },
  // Listar visitas (PROMOTER o superior, VIEWER para solo lectura)
  { pattern: '/visitas', requiredRole: ['ADMIN', 'SUPERVISOR', 'PROMOTER', 'SUPER_ADMIN', 'VIEWER'] },
  // Crear nueva visita (PROMOTER o superior - VIEWER no puede crear)
  { pattern: '/nueva-visita', requiredRole: ['ADMIN', 'SUPERVISOR', 'PROMOTER', 'SUPER_ADMIN'] },
  // Mis visitas (PROMOTER o superior, VIEWER para solo lectura)
  { pattern: '/mis-visitas', requiredRole: ['ADMIN', 'SUPERVISOR', 'PROMOTER', 'SUPER_ADMIN', 'VIEWER'] },
  
  // ========== RUTAS DE PERFIL ==========
  // Perfil del usuario (todos los roles autenticados)
  { pattern: '/mi-perfil', requiredRole: null },
  
  // ========== RUTAS DEMO/EXPERIMENTALES ==========
  // Captura de imágenes (PROMOTER o superior - VIEWER no puede capturar)
  { pattern: '/captura', requiredRole: ['ADMIN', 'SUPERVISOR', 'PROMOTER', 'SUPER_ADMIN'] },
];

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Verifica si una ruta es pública
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Encuentra el patrón de protección para una ruta
 * Retorna el patrón si la ruta está protegida, null si no
 */
function findProtectedPattern(pathname: string): { pattern: string; requiredRole: string | string[] | null } | null {
  for (const patternConfig of PROTECTED_PATTERNS) {
    if (pathname.startsWith(patternConfig.pattern)) {
      return patternConfig;
    }
  }
  return null;
}

/**
 * Decodifica un token JWT y extrae el payload
 * Nota: En producción, usar una librería JWT como jsonwebtoken
 */
function decodeJWT(token: string): { role?: string } | null {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    return {
      role: payload.role?.toUpperCase(),
    };
  } catch (error) {
    console.error('Error decodificando token JWT:', error);
    return null;
  }
}

/**
 * Verifica si un usuario tiene el rol requerido
 */
function hasRequiredRole(userRole: string | undefined, requiredRole: string | string[] | null): boolean {
  // Si no se requiere rol específico, cualquier rol autenticado es suficiente
  if (requiredRole === null) {
    return true;
  }
  
  // Si el usuario no tiene rol, no tiene acceso
  if (!userRole) {
    return false;
  }
  
  const normalizedUserRole = userRole.toUpperCase();
  
  // Si se requiere un rol específico
  if (typeof requiredRole === 'string') {
    return normalizedUserRole === requiredRole.toUpperCase();
  }
  
  // Si se requiere uno de varios roles
  if (Array.isArray(requiredRole)) {
    const normalizedRequiredRoles = requiredRole.map(role => role.toUpperCase());
    return normalizedRequiredRoles.includes(normalizedUserRole);
  }
  
  return false;
}

// ==================== MIDDLEWARE PRINCIPAL ====================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Verificar si es una ruta pública
  if (isPublicRoute(pathname)) {
    // Para rutas de login/register, si el usuario ya está autenticado, redirigir al inicio
    const token = request.cookies.get('auth_token')?.value;
    if (token && (pathname === '/auth/login' || pathname === '/auth/register')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Rutas públicas sin restricciones
    return NextResponse.next();
  }
  
  // 2. Verificar si la ruta está protegida
  const protectedPattern = findProtectedPattern(pathname);
  
  if (!protectedPattern) {
    // Ruta no reconocida - por defecto, requerir autenticación
    // Esto previene que nuevas rutas sean accesibles sin protección
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
  
  // 3. Obtener token de autenticación
  const token = request.cookies.get('auth_token')?.value;
  
  // 4. Si no hay token, redirigir a login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 5. Decodificar token y verificar rol
  const decodedToken = decodeJWT(token);
  
  if (!decodedToken) {
    // Token inválido - redirigir a login con error
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('error', 'invalid_token');
    return NextResponse.redirect(loginUrl);
  }
  
  // 6. Verificar si el usuario tiene el rol requerido
  if (!hasRequiredRole(decodedToken.role, protectedPattern.requiredRole)) {
    // Usuario autenticado pero sin permisos suficientes
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  // 7. Usuario autenticado y con permisos - permitir acceso
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
