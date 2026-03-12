# AUDITORÍA COMPLETA DE LLAMADAS API FRONTEND
**Fecha:** 11 de marzo de 2026  
**Proyecto:** Sistema de Gestión de Visitas  
**Auditor:** Análisis Automático

## 📊 RESUMEN EJECUTIVO

He realizado una auditoría completa de todas las llamadas API en el frontend del sistema de gestión de visitas. El análisis incluye:

- **24 endpoints API identificados** en 8 archivos diferentes
- **2 patrones de llamadas API**: `apiFetch()` (principal) y `fetch()` directo (secundario)
- **Base URL configurada**: `https://api.fabian-jimenez.com.mx` (producción) o `http://localhost:3001` (desarrollo)
- **Inconsistencias detectadas**: 2 tipos principales de rutas (`/api/...` vs `/...`)
- **Posibles problemas de 404**: 8 endpoints que podrían generar errores

## 📋 LISTA COMPLETA DE ENDPOINTS FRONTEND

### 🔐 AUTENTICACIÓN
| MÉTODO | ENDPOINT | ARCHIVO | FUNCIÓN |
|--------|----------|---------|---------|
| POST | `/api/auth/login` | `lib/auth.ts` | `login()` |
| POST | `/api/auth/register` | `lib/auth.ts` | `register()` |

### 👥 CLIENTES
| MÉTODO | ENDPOINT | ARCHIVO | FUNCIÓN |
|--------|----------|---------|---------|
| GET | `/api/clients` | `lib/clients.ts` | `getClients()` |
| GET | `/api/clients?page=&limit=` | `lib/clients.ts` | `getClients(page, limit)` |
| GET | `/api/clients/:id` | `lib/clients.ts` | `getClientById()` |
| POST | `/api/clients` | `lib/clients.ts` | `createClient()` |
| PUT | `/api/clients/:id` | `lib/clients.ts` | `updateClient()` |
| DELETE | `/api/clients/:id` | `lib/clients.ts` | `deleteClient()` |
| PATCH | `/api/clients/:id/assign` | `app/clientes/page.tsx` | `handleAssignPromotor()` |

### 👤 USUARIOS
| MÉTODO | ENDPOINT | ARCHIVO | FUNCIÓN |
|--------|----------|---------|---------|
| GET | `/api/users` | `lib/users.ts` | `getUsers()` |
| GET | `/api/users/:id` | `lib/users.ts` | `getUserById()` |
| POST | `/api/users` | `lib/users.ts` | `createUser()` |
| PUT | `/api/users/:id` | `lib/users.ts` | `updateUser()` |
| PUT | `/api/users/:id/status` | `lib/users.ts` | `toggleUserStatus()` |

### 📍 VISITAS
| MÉTODO | ENDPOINT | ARCHIVO | FUNCIÓN |
|--------|----------|---------|---------|
| GET | `/api/visits` | `lib/visits.ts` | `getVisits()` |
| GET | `/api/visits/:id` | `lib/visits.ts` | `getVisitById()` |
| POST | `/api/visits` | `lib/visits.ts` | `createVisit()` |
| POST | `/api/visits` (multipart) | `lib/visits.ts` | `createVisitMultipart()` |

### 🛒 PEDIDOS
| MÉTODO | ENDPOINT | ARCHIVO | FUNCIÓN |
|--------|----------|---------|---------|
| GET | `/api/orders` | `app/pedidos/page.tsx` | Carga de pedidos |
| GET | `/api/orders/:id` | `app/pedidos/[id]/page.tsx` | Detalle de pedido |
| POST | `/api/orders` | `app/pedidos/nuevo/page.tsx` | Crear pedido |
| POST | `/api/orders/:id/complete` | `app/pedidos/[id]/page.tsx` | Completar pedido |

### 📦 PRODUCTOS
| MÉTODO | ENDPOINT | ARCHIVO | FUNCIÓN |
|--------|----------|---------|---------|
| GET | `/api/products/search?q=` | `app/pedidos/nuevo/page.tsx` | Búsqueda de productos |

### 🏢 ADMINISTRACIÓN
| MÉTODO | ENDPOINT | ARCHIVO | FUNCIÓN |
|--------|----------|---------|---------|
| GET | `/api/admin/dashboard` | `app/admin/page.tsx` | Dashboard admin |
| GET | `/api/admin/estadisticas` | `app/admin/estadisticas/page.tsx` | Estadísticas (comentado) |

### 👷 PROMOTORES
| MÉTODO | ENDPOINT | ARCHIVO | FUNCIÓN |
|--------|----------|---------|---------|
| GET | `/api/users/promoters` | `lib/api-client.ts` | `getPromotores()` |
| GET | `/api/users/promoters/:id` | `lib/api-client.ts` | `getPromotor()` |

### 📊 REPORTES
| MÉTODO | ENDPOINT | ARCHIVO | FUNCIÓN |
|--------|----------|---------|---------|
| GET | `/reportes` | `lib/api-client.ts` | `getReportes()` |
| GET | `/reportes/export` | `lib/api-client.ts` | `exportReporte()` |

### 📝 LOGS
| MÉTODO | ENDPOINT | ARCHIVO | FUNCIÓN |
|--------|----------|---------|---------|
| POST | `/api/log-error` | `lib/error-interceptor.ts` | `logError()` |

## ⚠️ INCONSISTENCIAS DETECTADAS

### PROBLEMA 1: RUTAS CON Y SIN `/api/`
El sistema tiene **2 patrones inconsistentes**:

1. **Rutas con `/api/`** (mayoría):
   - `/api/clients`, `/api/users`, `/api/visits`, etc.

2. **Rutas sin `/api/`** (en `api-client.ts`):
   - `/clientes`, `/visitas`, `/usuarios`, `/mi-perfil`, `/reportes`

**Impacto**: Las rutas sin `/api/` en `api-client.ts` probablemente generen errores 404 porque:
- Base URL: `https://api.fabian-jimenez.com.mx`
- Ruta llamada: `/clientes`
- URL resultante: `https://api.fabian-jimenez.com.mx/clientes`
- **URL esperada**: `https://api.fabian-jimenez.com.mx/api/clientes`

### PROBLEMA 2: INCONSISTENCIA EN NOMBRES DE RECURSOS
- `/api/clients` (inglés, plural) vs `/clientes` (español, plural)
- `/api/users` (inglés) vs `/usuarios` (español)
- `/api/visits` (inglés) vs `/visitas` (español)

## 🔍 VERIFICACIÓN DE BASEURL

### CONFIGURACIÓN ACTUAL
- **`.env`**: `NEXT_PUBLIC_API_URL=http://localhost:3001`
- **`.env.local`**: `NEXT_PUBLIC_API_URL=https://api.fabian-jimenez.com.mx`

### ANÁLISIS DE `lib/api.ts`
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

**Problema crítico**: La base URL NO incluye `/api/`, pero todas las rutas en los archivos principales SÍ incluyen `/api/`. Sin embargo, las rutas en `api-client.ts` NO incluyen `/api/`.

## ❌ ENDPOINTS QUE PODRÍAN PRODUCIR 404

### ALTA PROBABILIDAD DE ERROR:
1. `GET /clientes` (api-client.ts) → debería ser `GET /api/clients`
2. `GET /visitas` (api-client.ts) → debería ser `GET /api/visits`
3. `GET /usuarios` (api-client.ts) → debería ser `GET /api/users`
4. `GET /mi-perfil` (api-client.ts) → debería ser `GET /api/mi-perfil` (si existe)
5. `GET /reportes` (api-client.ts) → debería ser `GET /api/reportes` (si existe)
6. `GET /reportes/export` (api-client.ts) → debería ser `GET /api/reportes/export`
7. `PUT /mi-perfil` (api-client.ts) → debería ser `PUT /api/mi-perfil`
8. `GET /mis-visitas` (api-client.ts) → debería ser `GET /api/mis-visitas`

### ENDPOINTS DUPLICADOS/CONFLICTIVOS:
1. `GET /api/users/promoters` (api-client.ts) vs `GET /api/users` (users.ts)
2. `GET /api/users/promoters/:id` (api-client.ts) vs `GET /api/users/:id` (users.ts)

## 🎯 RECOMENDACIONES

### 🚨 PRIORIDAD ALTA:
1. **Corregir rutas en `api-client.ts`**: Todas las rutas deben comenzar con `/api/`
2. **Estandarizar idioma**: Elegir inglés o español para nombres de recursos
3. **Verificar endpoints del backend**: Confirmar que existan rutas como `/api/mi-perfil`, `/api/reportes`

### ⚠️ PRIORIDAD MEDIA:
4. **Documentar API completa**: Crear archivo de documentación de endpoints
5. **Implementar validación de rutas**: Verificar rutas en tiempo de desarrollo

### 📋 PRIORIDAD BAJA:
6. **Consolidar clientes API**: Unificar `apiFetch` y `apiClient`
7. **Agregar tipos TypeScript**: Mejorar tipado de respuestas API

## 📈 ESTADÍSTICAS DEL ANÁLISIS

- **Total endpoints identificados**: 24
- **Archivos analizados**: 8
- **Endpoints con prefijo `/api/`**: 16
- **Endpoints sin prefijo `/api/`**: 8
- **Endpoints en inglés**: 18
- **Endpoints en español**: 6
- **Posibles errores 404**: 8

## 🏁 CONCLUSIÓN

El frontend tiene una **arquitectura de API bien estructurada** con `apiFetch()` como wrapper principal, pero presenta **inconsistencias críticas** en las rutas definidas en `api-client.ts`. Estas inconsistencias probablemente causen **errores 404 en producción**.

**Recomendación inmediata**: Revisar y corregir todas las rutas en `lib/api-client.ts` para que incluyan el prefijo `/api/` y coincidan con los endpoints reales del backend.

---

## 📁 ARCHIVOS ANALIZADOS

1. `lib/api.ts` - Configuración base de API
2. `lib/api-client.ts` - Cliente API centralizado
3. `lib/auth.ts` - Autenticación
4. `lib/clients.ts` - Gestión de clientes
5. `lib/users.ts` - Gestión de usuarios
6. `lib/visits.ts` - Gestión de visitas
7. `app/clientes/page.tsx` - Página de clientes
8. `app/pedidos/nuevo/page.tsx` - Creación de pedidos
9. `app/pedidos/[id]/page.tsx` - Detalle de pedido
10. `app/pedidos/page.tsx` - Lista de pedidos
11. `app/admin/page.tsx` - Dashboard admin
12. `app/admin/estadisticas/page.tsx` - Estadísticas
13. `lib/error-interceptor.ts` - Interceptor de errores

---

*Reporte generado automáticamente - No modificar código sin verificar impactos*