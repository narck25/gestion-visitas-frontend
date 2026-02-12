// Cliente API centralizado para producción
// Evita duplicación de lógica de fetch y maneja errores consistentemente

import { apiFetch, apiUpload, ApiError } from './api';
import { logError } from './error-interceptor';

// Tipos de datos comunes
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Cliente API con métodos específicos
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  // Método genérico para GET
  async get<T = any>(endpoint: string): Promise<T> {
    try {
      return await apiFetch<T>(endpoint);
    } catch (error) {
      this.handleApiError(error, endpoint, 'GET');
      throw error;
    }
  }

  // Método genérico para POST
  async post<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      return await apiFetch<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      this.handleApiError(error, endpoint, 'POST');
      throw error;
    }
  }

  // Método genérico para PUT
  async put<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      return await apiFetch<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      this.handleApiError(error, endpoint, 'PUT');
      throw error;
    }
  }

  // Método genérico para PATCH
  async patch<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      return await apiFetch<T>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      this.handleApiError(error, endpoint, 'PATCH');
      throw error;
    }
  }

  // Método genérico para DELETE
  async delete<T = any>(endpoint: string): Promise<T> {
    try {
      return await apiFetch<T>(endpoint, {
        method: 'DELETE',
      });
    } catch (error) {
      this.handleApiError(error, endpoint, 'DELETE');
      throw error;
    }
  }

  // Método para subir archivos
  async upload<T = any>(endpoint: string, formData: FormData): Promise<T> {
    try {
      return await apiUpload<T>(endpoint, formData);
    } catch (error) {
      this.handleApiError(error, endpoint, 'UPLOAD');
      throw error;
    }
  }

  // Manejo centralizado de errores de API
  private handleApiError(error: any, endpoint: string, method: string): void {
    const apiError = error as ApiError;
    
    logError(apiError.message || 'Error de API', 'high', {
      endpoint,
      method,
      status: apiError.status,
      errors: apiError.errors,
    });
  }

  // Métodos específicos para el sistema de visitas

  // Clientes
  async getClientes() {
    return this.get('/clientes');
  }

  async getCliente(id: number) {
    return this.get(`/clientes/${id}`);
  }

  async createCliente(data: any) {
    return this.post('/clientes', data);
  }

  async updateCliente(id: number, data: any) {
    return this.put(`/clientes/${id}`, data);
  }

  async deleteCliente(id: number) {
    return this.delete(`/clientes/${id}`);
  }

  // Visitas
  async getVisitas() {
    return this.get('/visitas');
  }

  async getVisita(id: number) {
    return this.get(`/visitas/${id}`);
  }

  async getMisVisitas() {
    return this.get('/mis-visitas');
  }

  async createVisita(data: any) {
    return this.post('/visitas', data);
  }

  async updateVisita(id: number, data: any) {
    return this.put(`/visitas/${id}`, data);
  }

  async deleteVisita(id: number) {
    return this.delete(`/visitas/${id}`);
  }

  // Usuarios
  async getUsuarios() {
    return this.get('/usuarios');
  }

  async getUsuario(id: number) {
    return this.get(`/usuarios/${id}`);
  }

  async getMiPerfil() {
    return this.get('/mi-perfil');
  }

  async updateMiPerfil(data: any) {
    return this.put('/mi-perfil', data);
  }

  // Promotores (para supervisores)
  async getPromotores() {
    return this.get('/promotores');
  }

  async getPromotor(id: number) {
    return this.get(`/promotores/${id}`);
  }

  // Reportes
  async getReportes(params?: Record<string, any>) {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.get(`/reportes${queryString}`);
  }

  async exportReporte(params: Record<string, any>) {
    const queryString = `?${new URLSearchParams(params).toString()}`;
    return this.get(`/reportes/export${queryString}`);
  }
}

// Instancia global del cliente API
export const apiClient = new ApiClient();

// Hook para usar el cliente API en componentes
export function useApiClient() {
  return apiClient;
}

// Funciones helper para manejo de respuestas
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw {
      message: response.message || 'Error en la respuesta del servidor',
      errors: response.errors,
    } as ApiError;
  }
  
  if (!response.data) {
    throw {
      message: 'No se recibieron datos en la respuesta',
    } as ApiError;
  }
  
  return response.data;
}

// Función para crear URLs con parámetros de consulta
export function buildUrl(endpoint: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }
  
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => `${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`).join('&');
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
  
  return `${endpoint}${queryString ? '?' + queryString : ''}`;
}

// Función para retry de peticiones fallidas
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // No reintentar para errores 4xx (excepto 429 - Too Many Requests)
      const status = (error as ApiError).status;
      if (status && status >= 400 && status < 500 && status !== 429) {
        break;
      }
      
      // Esperar antes del siguiente intento (exponential backoff)
      if (i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
}