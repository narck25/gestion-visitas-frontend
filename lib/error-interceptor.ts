// Interceptor global de errores para producción
// Este archivo maneja errores globales y proporciona logging seguro para producción

// Tipos de errores
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  message: string;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  timestamp: Date;
  stack?: string;
}

// Configuración de logging para producción
const isProduction = process.env.NODE_ENV === 'production';

// Almacenamiento de errores (en memoria para sesión actual)
const errorStore: AppError[] = [];

// Función para registrar errores de forma segura
export function logError(
  error: Error | string,
  severity: ErrorSeverity = 'medium',
  context?: Record<string, any>
): void {
  const appError: AppError = {
    message: typeof error === 'string' ? error : error.message,
    severity,
    context,
    timestamp: new Date(),
    stack: error instanceof Error ? error.stack : undefined,
  };

  // Guardar en almacenamiento
  errorStore.push(appError);
  
  // Limitar tamaño del almacenamiento
  if (errorStore.length > 100) {
    errorStore.shift();
  }

  // Logging condicional basado en entorno y severidad
  if (!isProduction || severity === 'critical' || severity === 'high') {
    // En desarrollo o errores críticos, mostrar en consola
    const logMessage = `[${severity.toUpperCase()}] ${appError.message}`;
    
    switch (severity) {
      case 'critical':
      case 'high':
        console.error(logMessage, { context, stack: appError.stack });
        break;
      case 'medium':
        console.warn(logMessage, { context });
        break;
      case 'low':
        console.info(logMessage, { context });
        break;
    }
  }

  // En producción, podrías enviar errores críticos/altos a un servicio de monitoreo
  if (isProduction && (severity === 'critical' || severity === 'high')) {
    // Aquí podrías integrar con Sentry, LogRocket, etc.
    sendToMonitoringService(appError);
  }
}

// Función para enviar errores a servicio de monitoreo (placeholder)
function sendToMonitoringService(error: AppError): void {
  // Implementación real dependería del servicio de monitoreo elegido
  // Ejemplo con fetch:
  /*
  try {
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error),
    });
  } catch (e) {
    // No hacer nada para evitar loops infinitos
  }
  */
}

// Interceptor para errores de API
export function apiErrorInterceptor(error: any): never {
  const apiError = error as { message?: string; status?: number };
  
  let severity: ErrorSeverity = 'medium';
  if (apiError.status === 401 || apiError.status === 403) {
    severity = 'high';
  } else if (apiError.status === 500 || apiError.status === 0) {
    severity = 'critical';
  }

  logError(apiError.message || 'Error de API desconocido', severity, {
    status: apiError.status,
    endpoint: window.location.pathname,
  });

  throw error;
}

// Interceptor para errores de red
export function networkErrorInterceptor(error: Error): never {
  logError('Error de conexión de red', 'high', {
    message: error.message,
    url: window.location.href,
  });

  throw error;
}

// Interceptor para errores de validación
export function validationErrorInterceptor(errors: Record<string, string[]>): void {
  logError('Error de validación de formulario', 'low', { errors });
}

// Función para obtener errores recientes (útil para debugging)
export function getRecentErrors(limit: number = 10): AppError[] {
  return errorStore.slice(-limit);
}

// Función para limpiar errores almacenados
export function clearErrorStore(): void {
  errorStore.length = 0;
}

// Hook para manejo global de errores en React
export function useGlobalErrorHandler() {
  const handleError = (error: Error, context?: string) => {
    logError(error, 'high', { reactContext: context });
  };

  const handlePromiseRejection = (event: PromiseRejectionEvent) => {
    logError(event.reason, 'high', { type: 'unhandled_promise_rejection' });
  };

  const handleWindowError = (event: ErrorEvent) => {
    logError(event.error || event.message, 'critical', { 
      type: 'window_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  };

  // Configurar listeners globales
  if (typeof window !== 'undefined') {
    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
  }

  return {
    handleError,
    cleanup: () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('error', handleWindowError);
        window.removeEventListener('unhandledrejection', handlePromiseRejection);
      }
    },
  };
}