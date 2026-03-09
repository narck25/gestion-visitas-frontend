// Módulo para manejo de visitas e imágenes
import { apiFetch, apiUpload, ApiError } from './api';

// Tipos de datos
export interface Visit {
  id: string;
  clientId: string;
  clientName: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  client?: {
    id: string;
    name: string;
  };
  promoter?: {
    id: string;
    name: string;
  };
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

export interface CreateVisitMultipartRequest {
  clientId: string;
  notes: string;
  latitude?: number;
  longitude?: number;
  beforePhotos: File[];
  afterPhotos: File[];
}

export interface CreateVisitResponse {
  id: string;
  clientId: string;
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

// Función para crear una nueva visita usando multipart/form-data
export async function createVisitMultipart(formData: FormData): Promise<any> {
  const token = localStorage.getItem("auth_token");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/visits`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error("Error creando visita");
  }

  return response.json();
}

// Función helper para obtener URL completa de foto
export function getPhotoUrl(path: string): string {
  if (!path) {
    console.warn('[DEBUG] getPhotoUrl: Path vacío o nulo');
    return '';
  }
  
  // Si ya es una URL completa, retornar tal cual
  if (path.startsWith('http')) {
    console.log(`[DEBUG] getPhotoUrl: URL completa detectada: ${path}`);
    return path;
  }
  
  // Si es base64, retornar tal cual
  if (path.startsWith('data:image')) {
    console.log('[DEBUG] getPhotoUrl: Base64 detectado');
    return path;
  }
  
  // Si es una ruta relativa, construir URL completa
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  console.log(`[DEBUG] getPhotoUrl: API_BASE_URL: ${API_BASE_URL}`);
  console.log(`[DEBUG] getPhotoUrl: Path original: ${path}`);
  
  // Asegurar que la ruta tenga slash inicial si no lo tiene
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const fullUrl = `${API_BASE_URL}${normalizedPath}`;
  
  console.log(`[DEBUG] getPhotoUrl: URL generada: ${fullUrl}`);
  return fullUrl;
}

// Función helper para obtener múltiples URLs de fotos
export function getPhotoUrls(paths: string[]): string[] {
  if (!paths || !Array.isArray(paths)) {
    console.warn('[DEBUG] getPhotoUrls: Paths inválido o no es array:', paths);
    return [];
  }
  
  return paths.map(path => getPhotoUrl(path));
}

// Función helper para verificar si una URL de imagen es válida
export async function checkImageUrl(url: string): Promise<boolean> {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && (contentType?.startsWith('image/') || false);
  } catch (error) {
    console.warn(`[DEBUG] checkImageUrl: Error verificando URL ${url}:`, error);
    return false;
  }
}

// Función helper para calcular duración de visita
export function getVisitDuration(start: string, end: string): string {
  if (!start || !end) return 'Duración no disponible';
  
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Datos de fecha inválidos';
    }
    
    const diffInMs = endDate.getTime() - startDate.getTime();
    
    // Si la diferencia es negativa (caso raro)
    if (diffInMs < 0) {
      return 'Datos inconsistentes';
    }
    
    const diffInMinutes = diffInMs / (1000 * 60);
    
    if (diffInMinutes < 1) {
      return 'Menos de 1 minuto';
    }
    
    if (diffInMinutes < 60) {
      return `${Math.round(diffInMinutes)} minutos`;
    }
    
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = Math.round(diffInMinutes % 60);
    
    if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    
    return `${hours} ${hours === 1 ? 'hora' : 'horas'} ${minutes} minutos`;
  } catch (error) {
    console.error('Error calculando duración:', error);
    return 'Error calculando duración';
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
export async function getVisitById(id: string): Promise<Visit> {
  try {
    console.log(`[DEBUG] getVisitById: Obteniendo visita con ID: ${id}`);
    const response = await apiFetch<any>(`/api/visits/${id}`);
    console.log('[DEBUG] getVisitById: Respuesta completa de la API:', response);
    
    // Extraer el objeto visit de la respuesta
    // Según los logs, la API devuelve: { "success": true, "data": { "visit": { ... } } }
    // También puede devolver otros formatos para compatibilidad
    
    let visit: any = null;
    
    // Formato 1: { success: true, data: { visit: { ... } } }
    if (response?.data?.visit) {
      visit = response.data.visit;
      console.log('[DEBUG] getVisitById: Extraído de response.data.visit');
    }
    // Formato 2: { visit: { ... } }
    else if (response?.visit) {
      visit = response.visit;
      console.log('[DEBUG] getVisitById: Extraído de response.visit');
    }
    // Formato 3: { success: true, data: { ... } } (data es directamente el visit)
    else if (response?.success && response?.data) {
      visit = response.data;
      console.log('[DEBUG] getVisitById: Extraído de response.data');
    }
    // Formato 4: Directamente el objeto visit
    else if (response?.id) {
      visit = response;
      console.log('[DEBUG] getVisitById: Respuesta es directamente el objeto visit');
    }
    
    if (!visit) {
      console.error('[DEBUG] getVisitById: No se pudo extraer la visita de la respuesta:', response);
      throw new Error(`No se pudo extraer la visita de la respuesta: ${JSON.stringify(response)}`);
    }
    
    console.log('[DEBUG] getVisitById: Objeto visit extraído:', visit);
    return visit;
  } catch (error) {
    const apiError = error as ApiError;
    console.error(`[DEBUG] Error al obtener visita ${id}:`, apiError.message);
    throw apiError;
  }
}
