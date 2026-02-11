// Módulo de autenticación
import { apiFetch, setAuthToken, removeAuthToken, ApiError } from './api';

// Tipos de datos
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
  };
  message: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

// Función para iniciar sesión
export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: username, password }),
    });
    
    // Guardar token en localStorage y cookies
    if (response.token) {
      setAuthToken(response.token);
      
      // También guardar en cookies para el middleware
      if (typeof document !== 'undefined') {
        document.cookie = `auth_token=${response.token}; path=/; max-age=86400; SameSite=Strict`;
      }
    }
    
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error al iniciar sesión:', apiError.message);
    
    // Manejar errores específicos
    if (apiError.status === 401) {
      throw {
        ...apiError,
        message: 'Usuario o contraseña incorrectos',
      } as ApiError;
    }
    
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

// Función para registrar un nuevo usuario
export async function register(name: string, email: string, password: string, confirmPassword: string): Promise<RegisterResponse> {
  try {
    // Validar datos antes de enviar
    const validation = validateRegistration(name, email, password, confirmPassword);
    if (!validation.isValid) {
      throw {
        message: validation.message,
        status: 400,
      } as ApiError;
    }

    const response = await apiFetch<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
    
    return response;
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Error al registrar usuario:', apiError.message);
    
    // Manejar errores específicos
    if (apiError.status === 400 && apiError.errors) {
      const validationMessages = Object.values(apiError.errors).flat().join(', ');
      throw {
        ...apiError,
        message: `Error de validación: ${validationMessages}`,
      } as ApiError;
    }
    
    if (apiError.status === 409) {
      throw {
        ...apiError,
        message: 'El usuario ya existe con este email',
      } as ApiError;
    }
    
    throw apiError;
  }
}

// Función para cerrar sesión
export function logout(): void {
  removeAuthToken();
  
  // Eliminar cookie de autenticación
  if (typeof document !== 'undefined') {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
  }
  
  // Redirigir a la página principal
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

// Función para obtener token de cookies
function getTokenFromCookies(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth_token' && value) {
      return value;
    }
  }
  return null;
}

// Función para verificar si el usuario está autenticado
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    console.log('isAuthenticated: window is undefined (SSR), returning false');
    return false;
  }
  
  // Primero intentar obtener de localStorage
  const localStorageToken = localStorage.getItem('auth_token');
  
  // Si no hay en localStorage, intentar obtener de cookies
  if (!localStorageToken) {
    const cookieToken = getTokenFromCookies();
    if (cookieToken) {
      // Si hay token en cookies pero no en localStorage, sincronizar
      localStorage.setItem('auth_token', cookieToken);
      return true;
    }
    return false;
  }
  
  return true;
}

// Función para obtener información del usuario desde el token
export function getUserInfo(): { username: string; name: string; role: string } | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return null;
  }
  
  try {
    // Decodificar el token JWT (parte del payload)
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    
    return {
      username: decoded.username || '',
      name: decoded.name || '',
      role: decoded.role || 'user',
    };
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
}

// Función para verificar si el usuario es administrador
export function isAdmin(): boolean {
  const userInfo = getUserInfo();
  return userInfo?.role === 'admin';
}

// Función para verificar si el usuario es promotor
export function isPromotor(): boolean {
  const userInfo = getUserInfo();
  return userInfo?.role === 'promotor' || userInfo?.role === 'user';
}

// Función para obtener el rol del usuario
export function getUserRole(): string | null {
  const userInfo = getUserInfo();
  return userInfo?.role || null;
}

// Función para verificar si el usuario tiene un rol específico
export function hasRole(role: string): boolean {
  const userInfo = getUserInfo();
  return userInfo?.role === role;
}

// Función para verificar si el usuario tiene alguno de los roles especificados
export function hasAnyRole(roles: string[]): boolean {
  const userInfo = getUserInfo();
  return roles.includes(userInfo?.role || '');
}

// Función para validar credenciales
export function validateCredentials(username: string, password: string): { isValid: boolean; message: string } {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();
  
  if (!trimmedUsername) {
    return {
      isValid: false,
      message: 'El nombre de usuario es requerido',
    };
  }
  
  if (!trimmedPassword) {
    return {
      isValid: false,
      message: 'La contraseña es requerida',
    };
  }
  
  if (trimmedUsername.length < 3) {
    return {
      isValid: false,
      message: 'El nombre de usuario debe tener al menos 3 caracteres',
    };
  }
  
  if (trimmedPassword.length < 6) {
    return {
      isValid: false,
      message: 'La contraseña debe tener al menos 6 caracteres',
    };
  }
  
  return {
    isValid: true,
    message: '',
  };
}

// Función para validar datos de registro
export function validateRegistration(name: string, email: string, password: string, confirmPassword: string): { isValid: boolean; message: string } {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const trimmedConfirmPassword = confirmPassword.trim();
  
  if (!trimmedName) {
    return {
      isValid: false,
      message: 'El nombre completo es requerido',
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
  
  if (!trimmedConfirmPassword) {
    return {
      isValid: false,
      message: 'La confirmación de contraseña es requerida',
    };
  }
  
  if (trimmedPassword !== trimmedConfirmPassword) {
    return {
      isValid: false,
      message: 'Las contraseñas no coinciden',
    };
  }
  
  if (trimmedPassword.length < 6) {
    return {
      isValid: false,
      message: 'La contraseña debe tener al menos 6 caracteres',
    };
  }
  
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: 'El nombre debe tener al menos 2 caracteres',
    };
  }
  
  return {
    isValid: true,
    message: '',
  };
}

// Función para verificar si el token es válido (haciendo una petición al servidor)
export async function validateToken(): Promise<boolean> {
  try {
    // Intentar hacer una petición que requiera autenticación
    await apiFetch('/api/clients');
    return true;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.status === 401) {
      return false;
    }
    // Otros errores podrían ser de conexión, no necesariamente token inválido
    return true;
  }
}