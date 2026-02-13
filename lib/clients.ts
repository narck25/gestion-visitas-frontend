// Módulo para manejo de clientes
import { apiFetch, ApiError } from './api';

// Tipos de datos
export interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  promotorId?: number;
}

// Tipo genérico para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Interfaz para respuesta de lista de clientes con paginación
export interface ClientsListResponse {
  clients: Client[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateClientRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
}

export interface CreateClientResponse {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  promotorId?: number;
}

export interface UpdateClientRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
}

export interface DeleteClientResponse {
  message: string;
}

// Función para obtener todos los clientes
export async function getClients(): Promise<Client[]> {
  try {
    const response = await apiFetch<ApiResponse<ClientsListResponse>>('/api/clients');
    
    // Validar que la respuesta sea exitosa
    if (!response.success) {
      console.warn('Respuesta no exitosa en getClients():', response);
      return [];
    }
    
    // Extraer los clientes de response.data.clients
    if (response.data && Array.isArray(response.data.clients)) {
      return response.data.clients;
    }
    
    // Si no hay clients en data, devolver array vacío
    console.warn('Formato de respuesta no reconocido en getClients(), devolviendo array vacío:', response);
    return [];
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error al obtener clientes:', apiError.message);
    throw apiError;
  }
}

// Función para obtener cliente por ID
export async function getClientById(id: number): Promise<Client> {
  try {
    const response = await apiFetch<ApiResponse<Client>>(`/api/clients/${id}`);
    
    // Validar que la respuesta sea exitosa
    if (!response.success) {
      throw {
        message: `Error al obtener cliente ${id}: respuesta no exitosa`,
        status: 500,
      } as ApiError;
    }
    
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    console.error(`Error al obtener cliente ${id}:`, apiError.message);
    throw apiError;
  }
}

// Función para buscar cliente por nombre
export async function findClientByName(name: string): Promise<Client | null> {
  try {
    const clients = await getClients();
    const normalizedSearch = name.toLowerCase().trim();
    
    const foundClient = clients.find(client => 
      client.name.toLowerCase().includes(normalizedSearch)
    );
    
    return foundClient || null;
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    return null;
  }
}

// Función para crear un nuevo cliente
export async function createClient(clientData: CreateClientRequest): Promise<CreateClientResponse> {
  try {
    const response = await apiFetch<ApiResponse<CreateClientResponse>>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
    
    // Validar que la respuesta sea exitosa
    if (!response.success) {
      throw {
        message: 'Error al crear cliente: respuesta no exitosa',
        status: 500,
      } as ApiError;
    }
    
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error al crear cliente:', apiError.message);
    
    // Si el error es de validación (400), mostrar mensajes específicos
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

// Función para actualizar un cliente
export async function updateClient(id: number, clientData: UpdateClientRequest): Promise<Client> {
  try {
    const response = await apiFetch<ApiResponse<Client>>(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
    
    // Validar que la respuesta sea exitosa
    if (!response.success) {
      throw {
        message: `Error al actualizar cliente ${id}: respuesta no exitosa`,
        status: 500,
      } as ApiError;
    }
    
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    console.error(`Error al actualizar cliente ${id}:`, apiError.message);
    
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

// Función para eliminar un cliente
export async function deleteClient(id: number): Promise<DeleteClientResponse> {
  try {
    const response = await apiFetch<ApiResponse<DeleteClientResponse>>(`/api/clients/${id}`, {
      method: 'DELETE',
    });
    
    // Validar que la respuesta sea exitosa
    if (!response.success) {
      throw {
        message: `Error al eliminar cliente ${id}: respuesta no exitosa`,
        status: 500,
      } as ApiError;
    }
    
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    console.error(`Error al eliminar cliente ${id}:`, apiError.message);
    throw apiError;
  }
}

// Función para obtener o crear cliente (búsqueda primero, luego creación si no existe)
export async function getOrCreateClient(name: string): Promise<number> {
  try {
    // Primero buscar si el cliente ya existe
    const existingClient = await findClientByName(name);
    
    if (existingClient) {
      return existingClient.id;
    }
    
    // Si no existe, crear nuevo cliente
    const newClient = await createClient({ name });
    return newClient.id;
    
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error al obtener/crear cliente:', apiError.message);
    throw apiError;
  }
}

// Función para validar datos de cliente
export function validateClientData(clientData: CreateClientRequest): { isValid: boolean; message: string } {
  const trimmedName = clientData.name?.trim() || '';
  
  if (!trimmedName) {
    return {
      isValid: false,
      message: 'El nombre del cliente es requerido',
    };
  }
  
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: 'El nombre debe tener al menos 2 caracteres',
    };
  }
  
  if (trimmedName.length > 100) {
    return {
      isValid: false,
      message: 'El nombre no puede exceder 100 caracteres',
    };
  }
  
  // Validar email si está presente
  if (clientData.email && clientData.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientData.email.trim())) {
      return {
        isValid: false,
        message: 'El email no tiene un formato válido',
      };
    }
  }
  
  return {
    isValid: true,
    message: '',
  };
}

// Función para obtener clientes por promotor
export async function getClientsByPromotor(promotorId: number): Promise<Client[]> {
  try {
    const clients = await getClients();
    // Filtrar clientes por promotorId (en una implementación real, el backend haría esto)
    return clients.filter(client => client.promotorId === promotorId);
  } catch (error) {
    console.error(`Error al obtener clientes del promotor ${promotorId}:`, error);
    return [];
  }
}
