// Módulo para manejo de usuarios
import { apiFetch, ApiError } from './api';

// Tipos de datos
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'PROMOTER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipo genérico para respuestas de API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: User['role'];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: User['role'];
  isActive?: boolean;
}

// Función para obtener todos los usuarios
export async function getUsers(): Promise<User[]> {
  try {
    const response = await apiFetch<ApiResponse<{ users: User[] }>>('/api/users');
    
    // Validar que la respuesta sea exitosa
    if (!response.success) {
      console.warn('Respuesta no exitosa en getUsers():', response);
      return [];
    }
    
    return response.data?.users ?? [];
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error al obtener usuarios:', apiError.message);
    throw apiError;
  }
}

// Función para obtener usuario por ID
export async function getUserById(id: string): Promise<User> {
  try {
    const response = await apiFetch<ApiResponse<User>>(`/api/users/${id}`);
    
    // Validar que la respuesta sea exitosa
    if (!response.success) {
      throw {
        message: `Error al obtener usuario ${id}: respuesta no exitosa`,
        status: 500,
      } as ApiError;
    }
    
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    console.error(`Error al obtener usuario ${id}:`, apiError.message);
    throw apiError;
  }
}

// Función para crear un nuevo usuario
export async function createUser(userData: CreateUserRequest): Promise<User> {
  try {
    const response = await apiFetch<ApiResponse<User>>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Validar que la respuesta sea exitosa
    if (!response.success) {
      throw {
        message: 'Error al crear usuario: respuesta no exitosa',
        status: 500,
      } as ApiError;
    }
    
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error al crear usuario:', apiError.message);
    
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

// Función para actualizar un usuario
export async function updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
  try {
    const response = await apiFetch<ApiResponse<User>>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    // Validar que la respuesta sea exitosa
    if (!response.success) {
      throw {
        message: `Error al actualizar usuario ${id}: respuesta no exitosa`,
        status: 500,
      } as ApiError;
    }
    
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    console.error(`Error al actualizar usuario ${id}:`, apiError.message);
    
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

// Función para activar/desactivar usuario
export async function toggleUserStatus(id: string): Promise<User> {
  try {
    const response = await apiFetch<ApiResponse<User>>(`/api/users/${id}/status`, {
      method: 'PUT',
    });
    
    // Validar que la respuesta sea exitosa
    if (!response.success) {
      throw {
        message: `Error al cambiar estado del usuario ${id}: respuesta no exitosa`,
        status: 500,
      } as ApiError;
    }
    
    return response.data;
  } catch (error) {
    const apiError = error as ApiError;
    console.error(`Error al cambiar estado del usuario ${id}:`, apiError.message);
    throw apiError;
  }
}

// Función para validar datos de usuario
export function validateUserData(userData: CreateUserRequest): { isValid: boolean; message: string } {
  const trimmedName = userData.name?.trim() || '';
  const trimmedEmail = userData.email?.trim() || '';
  const trimmedPassword = userData.password?.trim() || '';
  
  if (!trimmedName) {
    return {
      isValid: false,
      message: 'El nombre es requerido',
    };
  }
  
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: 'El nombre debe tener al menos 2 caracteres',
    };
  }
  
  if (!trimmedEmail) {
    return {
      isValid: false,
      message: 'El email es requerido',
    };
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      message: 'El email no tiene un formato válido',
    };
  }
  
  if (!trimmedPassword) {
    return {
      isValid: false,
      message: 'La contraseña es requerida',
    };
  }
  
  if (trimmedPassword.length < 6) {
    return {
      isValid: false,
      message: 'La contraseña debe tener al menos 6 caracteres',
    };
  }
  
  if (!userData.role) {
    return {
      isValid: false,
      message: 'El rol es requerido',
    };
  }
  
  const validRoles: User['role'][] = ['ADMIN', 'SUPERVISOR', 'PROMOTER'];
  if (!validRoles.includes(userData.role)) {
    return {
      isValid: false,
      message: 'El rol debe ser ADMIN, SUPERVISOR o PROMOTER',
    };
  }
  
  return {
    isValid: true,
    message: '',
  };
}

// Función para validar datos de actualización de usuario
export function validateUpdateUserData(userData: UpdateUserRequest): { isValid: boolean; message: string } {
  if (userData.name !== undefined) {
    const trimmedName = userData.name.trim();
    if (!trimmedName) {
      return {
        isValid: false,
        message: 'El nombre no puede estar vacío',
      };
    }
    
    if (trimmedName.length < 2) {
      return {
        isValid: false,
        message: 'El nombre debe tener al menos 2 caracteres',
      };
    }
  }
  
  if (userData.email !== undefined) {
    const trimmedEmail = userData.email.trim();
    if (!trimmedEmail) {
      return {
        isValid: false,
        message: 'El email no puede estar vacío',
      };
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return {
        isValid: false,
        message: 'El email no tiene un formato válido',
      };
    }
  }
  
  if (userData.role !== undefined) {
    const validRoles: User['role'][] = ['ADMIN', 'SUPERVISOR', 'PROMOTER'];
    if (!validRoles.includes(userData.role)) {
      return {
        isValid: false,
        message: 'El rol debe ser ADMIN, SUPERVISOR o PROMOTER',
      };
    }
  }
  
  return {
    isValid: true,
    message: '',
  };
}