# Reporte de Auditoría de API - Sistema de Gestión de Visitas

## Resumen Ejecutivo

**Fecha de Auditoría:** 11 de marzo de 2026  
**Versión del Proyecto:** Último commit `c0be03c738555d3e36e0ec2910fe3121ce7ac2b6`  
**Estado:** ✅ **CRÍTICO** - Se detectaron inconsistencias graves en las llamadas API

## Hallazgos Principales

### 🔴 **Problema Crítico: Inconsistencias en URLs de API**

Se identificaron **2 patrones problemáticos** en las llamadas fetch:

1. **URLs hardcodeadas con `localhost:3001`** - No respetan la variable de entorno `NEXT_PUBLIC_API_URL`
2. **Falta de uso consistente del cliente API centralizado** (`apiClient`)

### 📊 **Estadísticas de Llamadas API**

| Tipo | Cantidad | Estado |
|------|----------|--------|
| `apiFetch` (correcto) | 20+ | ✅ |
| `fetch` con URLs hardcodeadas | 3 | 🔴 |
| `apiClient` (métodos específicos) | 15+ | ✅ |
| `fetch` con URLs relativas | 1 | ⚠️ |

## 🔍 **Análisis Detallado**

### 1. **Configuración de Base URL**

**Archivos de configuración:**
- `.env`: `NEXT_PUBLIC_API_URL=http://localhost:3001`
- `.env.local`: `NEXT_PUBLIC_API_URL=https://api.fabian-jimenez.com.mx` (comentado)

**Implementación en código:**
- `lib/api.ts`: ✅ Correcto - Usa `API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'`
- `lib/api-client.ts`: ✅ Correcto - Constructor usa `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'`

### 2. **Llamadas Problemáticas Detectadas**

#### 🔴 **Problema 1: URLs hardcodeadas en `app/pedidos/[id]/page.tsx`**

```typescript
// LÍNEA 155-156
const response = await fetch(
  `http://localhost:3001/api/orders/${pedido.id}/complete`,
```

```typescript
// LÍNEA 195-196  
const response = await fetch(
  `http://localhost:3001/api/orders/${pedido?.id}/complete`,
```

**Impacto:** Estas llamadas NO respetan la configuración de `NEXT_PUBLIC_API_URL` y fallarán en producción.

#### 🔴 **Problema 2: URL hardcodeada en `app/captura/page.tsx`**

```typescript
// LÍNEA (código comentado/ejemplo)
const response = await fetch('http://localhost:3001/api/visitas/images', {
```

**Impacto:** Aunque está en código comentado, representa un patrón incorrecto.

#### ⚠️ **Problema 3: URL relativa en `lib/error-interceptor.ts`**

```typescript
// LÍNEA (aproximada)
fetch('/api/log-error', {
```

**Impacto:** Esta URL relativa depende del host actual del frontend, no del backend configurado.

### 3. **Llamadas Correctas Detectadas**

#### ✅ **Uso correcto de `apiFetch` (20+ instancias)**

Ejemplos en:
- `lib/visits.ts`: `/api/visits`, `/api/visits/${id}`
- `lib/users.ts`: `/api/users`, `/api/users/${id}`
- `lib/clients.ts`: `/api/clients`, `/api/clients/${id}`
- `lib/auth.ts`: `/api/auth/login`, `/api/auth/register`
- `app/pedidos/nuevo/page.tsx`: `/api/clients`, `/api/products/search`, `/api/orders`
- `app/pedidos/page.tsx`: `/api/orders`
- `app/admin/page.tsx`: `/api/admin/dashboard`

#### ✅ **Uso correcto de `apiClient` (15+ métodos)**

Métodos específicos en `lib/api-client.ts`:
- `getClientes()`, `getCliente(id)`, `createCliente(data)`, etc.
- `getVisitas()`, `getVisita(id)`, `createVisita(data)`, etc.
- `getUsuarios()`, `getUsuario(id)`, `getMiPerfil()`, etc.

### 4. **Patrones de Rutas API**

#### ✅ **Consistencia en prefijos de ruta:**
- `/api/clients` - Gestión de clientes
- `/api/visits` - Gestión de visitas  
- `/api/users` - Gestión de usuarios
- `/api/auth` - Autenticación
- `/api/orders` - Gestión de pedidos
- `/api/reportes` - Reportes
- `/api/admin` - Administración

#### ⚠️ **Inconsistencias menores:**
- `/api/mis-visitas` vs `/api/visits` (podría unificarse con query params)
- `/api/users/promoters` vs `/api/users` (subruta específica)

## 🚨 **Riesgos Identificados**

### **Riesgo Alto:**
1. **Fallo en producción** - Las URLs hardcodeadas con `localhost:3001` no funcionarán cuando el frontend se despliegue
2. **Inconsistencia de configuración** - Diferentes partes de la aplicación usan diferentes configuraciones

### **Riesgo Medio:**
1. **Mantenibilidad** - Código duplicado y patrones inconsistentes
2. **Testing** - Dificultad para mockear APIs en pruebas

### **Riesgo Bajo:**
1. **Performance** - Múltiples implementaciones de fetch con lógica similar

## 🛠️ **Recomendaciones de Corrección**

### **Prioridad 1 (Crítico):**
1. **Reemplazar URLs hardcodeadas en `app/pedidos/[id]/page.tsx`:**
   ```typescript
   // ANTES:
   fetch(`http://localhost:3001/api/orders/${id}/complete`, ...)
   
   // DESPUÉS:
   apiFetch(`/api/orders/${id}/complete`, ...)
   // O:
   apiClient.patch(`/api/orders/${id}/complete`, data)
   ```

2. **Eliminar/Corregir ejemplo en `app/captura/page.tsx`:**
   ```typescript
   // Reemplazar ejemplo hardcodeado con:
   // const response = await apiFetch('/api/visitas/images', { method: 'POST' })
   ```

### **Prioridad 2 (Alto):**
3. **Corregir `lib/error-interceptor.ts`:**
   ```typescript
   // ANTES:
   fetch('/api/log-error', ...)
   
   // DESPUÉS:
   apiFetch('/api/log-error', ...)
   ```

4. **Crear método específico en `apiClient` para operaciones de pedidos:**
   ```typescript
   // En lib/api-client.ts agregar:
   async completeOrder(id: string, intelisisFolio: string) {
     return this.patch(`/api/orders/${id}/complete`, { intelisisFolio });
   }
   ```

### **Prioridad 3 (Medio):**
5. **Estandarizar uso de `apiClient` en toda la aplicación**
6. **Documentar patrones de API en README o guía de desarrollo**
7. **Crear tests que verifiquen consistencia de URLs**

## 📋 **Plan de Implementación**

### **Fase 1: Correcciones Críticas (1-2 horas)**
1. Corregir `app/pedidos/[id]/page.tsx` - 2 instancias
2. Corregir ejemplo en `app/captura/page.tsx`
3. Corregir `lib/error-interceptor.ts`

### **Fase 2: Mejoras (2-3 horas)**
4. Agregar métodos faltantes a `apiClient`
5. Actualizar componentes para usar `apiClient` en lugar de `apiFetch` directo
6. Crear documentación de API patterns

### **Fase 3: Prevención (1 hora)**
7. Configurar ESLint rule para detectar URLs hardcodeadas
8. Agregar test de smoke test para verificar configuración

## 🔧 **Herramientas Sugeridas**

1. **ESLint Rule:** Crear regla personalizada para detectar `fetch\(['"](http://localhost|https?://[^'"]+)['"]`
2. **Script de validación:** `npm run validate-api-urls`
3. **Test de integración:** Verificar que todas las llamadas respeten `NEXT_PUBLIC_API_URL`

## 📈 **Métricas de Éxito**

- [ ] 0 URLs hardcodeadas con `localhost:3001`
- [ ] 100% de llamadas API usando `apiFetch` o `apiClient`
- [ ] Configuración consistente en todos los entornos
- [ ] Tests que validan comportamiento en diferentes configuraciones

## 🎯 **Conclusión**

El proyecto tiene una **arquitectura de API bien diseñada** con `apiFetch` y `apiClient`, pero **sufre de inconsistencias de implementación** que causarán fallos en producción.

**Recomendación inmediata:** Ejecutar las correcciones de Prioridad 1 antes de cualquier despliegue a producción.

**Estado general:** ⚠️ **Requiere atención inmediata** - Las correcciones son simples pero críticas para el funcionamiento en producción.

---

*Reporte generado automáticamente por auditoría de código*  
*Última actualización: 11 de marzo de 2026*