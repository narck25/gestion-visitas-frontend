import { NextRequest, NextResponse } from 'next/server';

// Función para obtener uptime en formato legible
function getUptime() {
  const uptime = process.uptime();
  
  // Convertir a formato legible
  const days = Math.floor(uptime / (3600 * 24));
  const hours = Math.floor((uptime % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

export async function GET(request: NextRequest) {
  try {
    // Obtener información del sistema
    const timestamp = new Date().toISOString();
    const uptime = getUptime();
    
    // Información de la aplicación
    const appInfo = {
      success: true,
      status: "ok",
      timestamp,
      uptime,
      version: process.env.npm_package_version || "1.0.0",
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(process.memoryUsage().external / 1024 / 1024)} MB`,
      },
      environment: process.env.NODE_ENV || "development",
    };

    // Configurar headers para caché y CORS
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('Surrogate-Control', 'no-store');
    
    // Headers para monitoreo
    headers.set('X-Health-Check', 'true');
    headers.set('X-App-Version', appInfo.version);
    headers.set('X-Status', appInfo.status);

    return new NextResponse(
      JSON.stringify(appInfo, null, 2),
      {
        status: 200,
        headers,
      }
    );
    
  } catch (error) {
    // En caso de error, devolver un estado de error
    const errorInfo = {
      success: false,
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      uptime: getUptime(),
    };

    return new NextResponse(
      JSON.stringify(errorInfo, null, 2),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

// Configuración de la ruta
export const dynamic = 'force-dynamic'; // Asegurar que no se cachee
export const revalidate = 0; // No cachear
export const runtime = 'nodejs'; // Usar runtime Node.js para acceso a process.uptime()

// Métodos HTTP permitidos
export async function HEAD(request: NextRequest) {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('X-Health-Check', 'true');
  headers.set('X-Status', 'ok');
  
  return new NextResponse(null, {
    status: 200,
    headers,
  });
}

// Método OPTIONS para CORS
export async function OPTIONS(request: NextRequest) {
  const headers = new Headers();
  headers.set('Allow', 'GET, HEAD, OPTIONS');
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return new NextResponse(null, {
    status: 200,
    headers,
  });
}