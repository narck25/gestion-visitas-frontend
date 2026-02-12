// Validaciones con Zod para formularios
import { z } from 'zod';

// Esquema para login
export const loginSchema = z.object({
  username: z.string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(50, 'El usuario no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guiones bajos'),
  
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Esquema para cliente
export const clienteSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  contactPerson: z.string()
    .min(2, 'La persona de contacto debe tener al menos 2 caracteres')
    .max(100, 'La persona de contacto no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  email: z.string()
    .email('Correo electrónico inválido')
    .optional()
    .or(z.literal(''))
    .transform(val => val || undefined),
  
  phone: z.string()
    .regex(/^[\d\s\+\-\(\)]{7,20}$/, 'Número de teléfono inválido')
    .optional()
    .or(z.literal('')),
  
  address: z.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
  
  notes: z.string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;

// Esquema para visita
export const visitaSchema = z.object({
  clienteId: z.number()
    .int('ID de cliente inválido')
    .positive('ID de cliente inválido'),
  
  fecha: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  
  hora: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  
  ubicacion: z.string()
    .min(5, 'La ubicación debe tener al menos 5 caracteres')
    .max(200, 'La ubicación no puede exceder 200 caracteres'),
  
  notas: z.string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  
  fotos: z.array(z.instanceof(File))
    .max(10, 'Máximo 10 fotos permitidas')
    .optional()
    .default([]),
  
  latitud: z.number()
    .min(-90, 'Latitud inválida')
    .max(90, 'Latitud inválida')
    .optional(),
  
  longitud: z.number()
    .min(-180, 'Longitud inválida')
    .max(180, 'Longitud inválida')
    .optional(),
});

export type VisitaFormData = z.infer<typeof visitaSchema>;

// Esquema para perfil de usuario
export const perfilSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  email: z.string()
    .email('Correo electrónico inválido'),
  
  phone: z.string()
    .regex(/^[\d\s\+\-\(\)]{7,20}$/, 'Número de teléfono inválido')
    .optional()
    .or(z.literal('')),
  
  currentPassword: z.string()
    .min(6, 'La contraseña actual debe tener al menos 6 caracteres')
    .optional()
    .or(z.literal('')),
  
  newPassword: z.string()
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
    .max(100, 'La nueva contraseña no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  confirmPassword: z.string()
    .optional()
    .or(z.literal('')),
}).refine(data => {
  // Validar que si se proporciona nueva contraseña, también se proporcione la actual
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Debes proporcionar la contraseña actual para cambiarla',
  path: ['currentPassword'],
}).refine(data => {
  // Validar que las nuevas contraseñas coincidan
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type PerfilFormData = z.infer<typeof perfilSchema>;

// Esquema para búsqueda y filtros
export const filtroSchema = z.object({
  search: z.string()
    .max(100, 'La búsqueda no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  fechaDesde: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .optional()
    .or(z.literal('')),
  
  fechaHasta: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .optional()
    .or(z.literal('')),
  
  estado: z.string()
    .optional()
    .or(z.literal('')),
  
  promotorId: z.number()
    .int('ID de promotor inválido')
    .positive('ID de promotor inválido')
    .optional(),
});

export type FiltroFormData = z.infer<typeof filtroSchema>;

// Función helper para validar formularios
export async function validateForm<T>(
  schema: z.ZodSchema<T>,
  formData: FormData | Record<string, any>
): Promise<{ success: true; data: T } | { success: false; errors: Record<string, string> }> {
  try {
    let data: any;
    
    if (formData instanceof FormData) {
      // Convertir FormData a objeto
      data = Object.fromEntries(formData.entries());
      
      // Manejar arrays (como fotos)
      for (const [key, value] of formData.entries()) {
        if (key.endsWith('[]')) {
          const cleanKey = key.slice(0, -2);
          if (!data[cleanKey]) {
            data[cleanKey] = [];
          }
          data[cleanKey].push(value);
        }
      }
    } else {
      data = formData;
    }
    
    // Validar con Zod
    const validatedData = await schema.parseAsync(data);
    
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      
      error.errors.forEach((err: any) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      
      return {
        success: false,
        errors,
      };
    }
    
    // Error inesperado
    return {
      success: false,
      errors: { _form: 'Error de validación inesperado' },
    };
  }
}

// Función para obtener mensajes de error de validación
export function getValidationErrors<T>(
  result: { success: false; errors: Record<string, string> }
): Record<string, string> {
  return result.errors;
}

// Función para mostrar errores de validación en UI
export function displayValidationError(
  errors: Record<string, string>,
  field: string
): string | undefined {
  return errors[field];
}

// Función para limpiar datos antes de enviar a API
export function sanitizeFormData<T>(data: T): Partial<T> {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data as any)) {
    // Eliminar campos vacíos o undefined
    if (value !== undefined && value !== null && value !== '') {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}