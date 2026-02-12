// Utilidades centralizadas para manejo de roles
// Elimina duplicación de lógica de roles en toda la aplicación

import { getUserInfo } from './auth';

// Tipos de roles del sistema
export type UserRole = 'admin' | 'supervisor' | 'promotor' | 'user' | string;

// Normalizar rol a formato estándar
export function normalizeRole(role: string | undefined | null): UserRole {
  if (!role) return 'user';
  
  const normalized = role.toLowerCase().trim();
  
  // Mapear variaciones comunes
  switch (normalized) {
    case 'administrador':
    case 'admin':
    case 'administrator':
      return 'admin';
    
    case 'supervisor':
    case 'super':
    case 'manager':
      return 'supervisor';
    
    case 'promotor':
    case 'promoter':
    case 'vendedor':
    case 'sales':
      return 'promotor';
    
    case 'user':
    case 'usuario':
    case 'cliente':
    case 'client':
      return 'user';
    
    default:
      return normalized as UserRole;
  }
}

// Obtener rol del usuario actual (normalizado)
export function getCurrentUserRole(): UserRole {
  const userInfo = getUserInfo();
  return normalizeRole(userInfo?.role);
}

// Verificar si el usuario tiene un rol específico
export function hasRole(role: UserRole | UserRole[]): boolean {
  const currentRole = getCurrentUserRole();
  
  if (Array.isArray(role)) {
    return role.some(r => normalizeRole(r) === currentRole);
  }
  
  return normalizeRole(role) === currentRole;
}

// Verificar si el usuario es administrador
export function isUserAdmin(): boolean {
  return hasRole('admin');
}

// Verificar si el usuario es supervisor
export function isUserSupervisor(): boolean {
  return hasRole('supervisor');
}

// Verificar si el usuario es promotor
export function isUserPromotor(): boolean {
  return hasRole('promotor');
}

// Verificar si el usuario es usuario regular
export function isUserRegular(): boolean {
  return hasRole('user');
}

// Verificar si el usuario puede acceder a módulo de clientes
export function canAccessClientes(): boolean {
  const role = getCurrentUserRole();
  return role === 'admin' || role === 'supervisor' || role === 'promotor';
}

// Verificar si el usuario puede acceder a módulo de supervisor
export function canAccessSupervisor(): boolean {
  const role = getCurrentUserRole();
  return role === 'admin' || role === 'supervisor';
}

// Verificar si el usuario puede crear clientes
export function canCreateClientes(): boolean {
  const role = getCurrentUserRole();
  return role === 'admin' || role === 'supervisor' || role === 'promotor';
}

// Verificar si el usuario puede editar clientes
export function canEditClientes(): boolean {
  const role = getCurrentUserRole();
  return role === 'admin' || role === 'supervisor';
}

// Verificar si el usuario puede eliminar clientes
export function canDeleteClientes(): boolean {
  const role = getCurrentUserRole();
  return role === 'admin';
}

// Obtener permisos del usuario actual
export function getUserPermissions() {
  const role = getCurrentUserRole();
  
  return {
    // Módulos
    canAccessDashboard: true,
    canAccessClientes: canAccessClientes(),
    canAccessSupervisor: canAccessSupervisor(),
    canAccessAdmin: role === 'admin',
    
    // Operaciones de clientes
    canCreateClientes: canCreateClientes(),
    canEditClientes: canEditClientes(),
    canDeleteClientes: canDeleteClientes(),
    canViewAllClientes: role === 'admin' || role === 'supervisor',
    
    // Operaciones de visitas
    canCreateVisitas: role === 'admin' || role === 'supervisor' || role === 'promotor',
    canEditVisitas: role === 'admin' || role === 'supervisor',
    canDeleteVisitas: role === 'admin',
    canViewAllVisitas: role === 'admin' || role === 'supervisor',
    
    // Operaciones de usuarios
    canManageUsers: role === 'admin',
    canManagePromotores: role === 'admin' || role === 'supervisor',
    
    // Exportación
    canExportData: role === 'admin' || role === 'supervisor',
    canExportAllData: role === 'admin',
  };
}

// Hook para usar permisos en componentes
export function useUserPermissions() {
  return getUserPermissions();
}

// Hook para verificar rol específico
export function useRoleCheck(requiredRole: UserRole | UserRole[]): boolean {
  return hasRole(requiredRole);
}

// Función para obtener nombre legible del rol
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'supervisor':
      return 'Supervisor';
    case 'promotor':
      return 'Promotor';
    case 'user':
      return 'Usuario';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
}

// Función para obtener color asociado al rol (para UI)
export function getRoleColor(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'supervisor':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'promotor':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'user':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Función para obtener icono asociado al rol
export function getRoleIcon(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '👑';
    case 'supervisor':
      return '👨‍💼';
    case 'promotor':
      return '👨‍💻';
    case 'user':
      return '👤';
    default:
      return '👤';
  }
}