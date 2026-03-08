// Módulo para manejo de visitas e imágenes
import { apiFetch, apiUpload, ApiError } from './api';

// Tipos de datos
export interface Visit {
  id: number;
  clientId: number;
  clientName: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitRequest {
  clientId: string;
  notes: string;
  date?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  beforePhotos: string[];
  afterPhotos: string[];
  signature?: string;
}

export interface CreateVisitResponse {
  id: number;
  clientId: number;
  clientName: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  notes: string;
  status: string;
  message: string;
}

// Función para crear una nueva visita
export async function createVisit(data: CreateVisitRequest): Promise<CreateVisitResponse> {
  try {
    // Asegurar que beforePhotos y afterPhotos sean arrays
    const payload = {
      ...data,
      beforePhotos: data.beforePhotos || [],
      afterPhotos: data.afterPhotos || [],
    };
    
    const response = await apiFetch<CreateVisitResponse>('/api/visits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error al crear visita:', apiError.message);
    
    // Manejar errores específicos
    if (apiError.status === 400 && apiError.errors) {
      const validationMessages = Object.values(apiError.errors).flat().join(', ');
      throw {
        ...apiError,
        message: `Error de validación: ${validationMessages}`,
      } as ApiError;
    }
    
    throw apiError;
  }
}

// Función para validar datos de visita
export function validateVisitData(data: {
  clientId?: string;
  notes?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
}): { isValid: boolean; message: string } {
  
  if (!data.clientId || data.clientId.trim() === '') {
    return {
      isValid: false,
      message: 'Se requiere un cliente válido',
    };
  }
  
  if (data.notes && data.notes.length > 1000) {
    return {
      isValid: false,
      message: 'Las notas no pueden exceder 1000 caracteres',
    };
  }
  
  // Asegurar que beforePhotos y afterPhotos sean arrays
  if (data.beforePhotos && !Array.isArray(data.beforePhotos)) {
    return {
      isValid: false,
      message: 'Las fotos ANTES deben ser un array',
    };
  }
  
  if (data.afterPhotos && !Array.isArray(data.afterPhotos)) {
    return {
      isValid: false,
      message: 'Las fotos DESPUÉS deben ser un array',
    };
  }
  
  return {
    isValid: true,
    message: '',
  };
}

// Función para obtener todas las visitas
export async function getVisits(): Promise<Visit[]> {
  try {
    const response = await apiFetch<any>('/api/visits');
    
    // La API devuelve { success: boolean, data: { visits: [], pagination: {} } }
    // Extraer el array de visitas de la respuesta
    if (response && response.success && response.data && response.data.visits) {
      return response.data.visits;
    } else if (Array.isArray(response)) {
      // Si la respuesta es directamente un array (para compatibilidad)
      return response;
    } else if (response && response.visits) {
      // Si la respuesta tiene visits en el nivel superior
      return response.visits;
    }
    
    // Si no se pudo extraer visitas, devolver array vacío
    console.warn('Formato de respuesta inesperado:', response);
    return [];
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error al obtener visitas:', apiError.message);
    throw apiError;
  }
}

// Función para obtener una visita por ID
export async function getVisitById(id: number): Promise<Visit> {
  try {
    const visit = await apiFetch<Visit>(`/api/visits/${id}`);
    return visit;
  } catch (error) {
    const apiError = error as ApiError;
    console.error(`Error al obtener visita ${id}:`, apiError.message);
    throw apiError;
  }
}