# Plan de Implementación - Sistema de Gestión de Visitas

## Análisis del Estado Actual

### ✅ Funcionalidades Existentes:
1. **Autenticación y Roles**: Sistema completo con middleware, RoleGuard y normalización de roles
2. **Páginas Básicas**: 
   - Dashboard principal (/)
   - Login/Registro (/auth/login, /auth/register)
   - Nueva visita (/nueva-visita)
   - Mis visitas (/mis-visitas) - parcialmente funcional
   - Admin (/admin) - básico
   - Captura (/captura) - demo
3. **Componentes Clave**:
   - RoleGuard.tsx - protección por roles
   - CameraCapture.tsx - captura de imágenes
   - AuthGuard.tsx - protección de rutas
4. **Servicios API**:
   - lib/api.ts - cliente HTTP con manejo de tokens
   - lib/auth.ts - autenticación y gestión de usuarios
   - lib/clients.ts - gestión de clientes (básico)
   - lib/visits.ts - gestión de visitas

### ❌ Problemas Identificados:

1. **Módulo CLIENTES no existe**: 
   - No hay página /clientes
   - No hay CRUD completo de clientes
   - No hay filtros por rol

2. **Botón "Mis Visitas" no visible en dashboard**:
   - Solo accesible por URL directa

3. **/mis-visitas con problemas**:
   - Botón "Ver detalles" no navega a /visitas/[id]
   - Botón "Exportar" no funcional
   - Inputs con texto gris (text-gray-400)

4. **Falta página dinámica /visitas/[id]**:
   - No existe vista de detalle de visita
   - No muestra notas, fotos, cliente, fecha, ubicación

5. **No existe panel SUPERVISOR**:
   - No hay ruta /supervisor
   - No hay lista de promotores asignados
   - No hay lista de clientes del equipo
   - No hay lista de visitas del equipo

6. **Problemas de estilo**:
   - Inputs y selects con texto gris
   - Bajo contraste en campos editables

7. **API calls no verifican process.env.NEXT_PUBLIC_API_URL**:
   - No hay manejo elegante de errores 404

## Plan de Implementación

### Fase 1: Módulo CLIENTES (Prioridad Alta)
1. Crear página `/app/clientes/page.tsx`
2. Crear componentes para:
   - Lista de clientes con paginación
   - Formulario de creación/edición
   - Modal de confirmación de eliminación
3. Integrar con RoleGuard para control de acceso
4. Conectar con API existente en `lib/clients.ts`

### Fase 2: Dashboard Mejorado
1. Agregar botón "Mis Visitas" en dashboard principal
2. Mejorar navegación por roles
3. Agregar estadísticas rápidas

### Fase 3: Corrección de /mis-visitas
1. Hacer funcional botón "Ver detalles" (navegación a /visitas/[id])
2. Implementar exportación a CSV y PDF
3. Corregir estilos de inputs (text-gray-900)

### Fase 4: Página Dinámica /visitas/[id]
1. Crear `/app/visitas/[id]/page.tsx`
2. Mostrar detalles completos de visita
3. Integrar galería de fotos si CameraCapture está disponible
4. Agregar botones de acción (editar, eliminar, volver)

### Fase 5: Panel SUPERVISOR
1. Crear `/app/supervisor/page.tsx`
2. Componentes para:
   - Lista de promotores asignados
   - Lista de clientes del equipo
   - Lista de visitas del equipo
   - Filtros por fecha y promotor
3. Integrar con RoleGuard (rol SUPERVISOR)

### Fase 6: Correcciones de Estilo y API
1. Reemplazar text-gray-400 por text-gray-900 en inputs/editables
2. Mejorar contraste general
3. Verificar todas las llamadas API usen process.env.NEXT_PUBLIC_API_URL
4. Implementar manejo elegante de errores 404 (toast/alert)

### Fase 7: Testing y Validación
1. Probar todos los flujos de usuario
2. Verificar protección por roles
3. Validar exportación de datos
4. Probar responsive design

## Estructura de Archivos a Crear/Modificar

### Nuevos Archivos:
```
app/clientes/
  ├── page.tsx
  ├── crear/
  │   └── page.tsx
  ├── editar/
  │   └── [id]/page.tsx
  └── components/
      ├── ClientesList.tsx
      ├── ClienteForm.tsx
      └── DeleteClienteModal.tsx

app/visitas/
  └── [id]/
      └── page.tsx

app/supervisor/
  ├── page.tsx
  └── components/
      ├── PromotoresList.tsx
      ├── ClientesEquipo.tsx
      └── VisitasEquipo.tsx

components/
  ├── ExportButton.tsx
  ├── ToastNotification.tsx
  └── ErrorBoundary.tsx

lib/
  ├── export.ts (funciones de exportación)
  └── supervisor.ts (servicios para supervisor)
```

### Archivos a Modificar:
```
app/page.tsx (agregar botón Mis Visitas)
app/mis-visitas/page.tsx (corregir estilos y funcionalidad)
lib/api.ts (mejorar manejo de errores)
middleware.ts (agregar rutas protegidas)
```

## Consideraciones Técnicas

1. **Mantener App Router**: No cambiar arquitectura existente
2. **Preservar RoleGuard**: Mantener sistema de roles actual
3. **Consistencia de Estilos**: Usar Tailwind CSS como actual
4. **Responsive Design**: Mantener diseño mobile-first
5. **Manejo de Errores**: Implementar toast notifications elegantes
6. **Performance**: Usar Suspense y loading states apropiados
7. **Seguridad**: Validar todos los inputs y proteger rutas

## Timeline Estimado

1. **Día 1**: Módulo CLIENTES + Dashboard mejorado
2. **Día 2**: Correcciones /mis-visitas + página /visitas/[id]
3. **Día 3**: Panel SUPERVISOR
4. **Día 4**: Correcciones de estilo y API + testing

Este plan aborda todos los problemas identificados manteniendo la arquitectura existente y mejorando la experiencia de usuario.