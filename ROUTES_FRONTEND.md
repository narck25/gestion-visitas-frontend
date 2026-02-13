# 📘 FRONTEND ROUTES DOCUMENTATION

## 🌍 Base URL
http://localhost:3000

---

## 🏠 PUBLIC ROUTES

| Route | Protected | Role Required | File Path | Description |
|-------|-----------|---------------|-----------|-------------|
| `/` | ❌ No | Ninguno | `app/page.tsx` | Página principal con login integrado |
| `/auth/login` | ❌ No | Ninguno | `app/auth/login/page.tsx` | Página de inicio de sesión |
| `/auth/register` | ❌ No | Ninguno | `app/auth/register/page.tsx` | Página de registro de usuario |
| `/health` | ❌ No | Ninguno | `app/health/route.ts` | Endpoint de health check del frontend |
| `/unauthorized` | ❌ No | Ninguno | `app/unauthorized/page.tsx` | Página de acceso no autorizado |

---

## 👤 AUTH ROUTES (Requieren autenticación)

| Route | Protected | Role Required | File Path | Description |
|-------|-----------|---------------|-----------|-------------|
| `/nueva-visita` | ✅ Sí | `PROMOTOR`, `USER` | `app/nueva-visita/page.tsx` | Crear nueva visita |
| `/mis-visitas` | ✅ Sí | `PROMOTOR`, `USER` | `app/mis-visitas/page.tsx` | Ver visitas del usuario |
| `/mi-perfil` | ✅ Sí | Todos los roles | `app/mi-perfil/page.tsx` | Perfil del usuario |
| `/captura` | ✅ Sí | `PROMOTOR`, `USER` | `app/captura/page.tsx` | Demo de captura de imágenes |

---

## 👨‍💼 ADMIN ROUTES

| Route | Protected | Role Required | File Path | Description |
|-------|-----------|---------------|-----------|-------------|
| `/admin` | ✅ Sí | `ADMIN` | `app/admin/page.tsx` | Panel de administración |
| `/admin/users` | ⚠️ Referenciada | `ADMIN` | Referenciada en admin/page.tsx | Gestión de usuarios (no existe archivo) |
| `/admin/reports` | ⚠️ Referenciada | `ADMIN` | Referenciada en admin/page.tsx | Reportes (no existe archivo) |
| `/admin/settings` | ⚠️ Referenciada | `ADMIN` | Referenciada en admin/page.tsx | Configuración (no existe archivo) |
| `/admin/calendar` | ⚠️ Referenciada | `ADMIN` | Referenciada en admin/page.tsx | Calendario (no existe archivo) |

---

## 🧑‍💼 SUPERVISOR ROUTES

| Route | Protected | Role Required | File Path | Description |
|-------|-----------|---------------|-----------|-------------|
| `/supervisor` | ✅ Sí | `SUPERVISOR`, `ADMIN` | `app/supervisor/page.tsx` | Panel de supervisor |

---

## 👥 PROMOTOR ROUTES

| Route | Protected | Role Required | File Path | Description |
|-------|-----------|---------------|-----------|-------------|
| `/clientes` | ✅ Sí | `ADMIN`, `SUPERVISOR`, `PROMOTOR` | `app/clientes/page.tsx` | Lista de clientes |
| `/clientes/crear` | ✅ Sí | `ADMIN`, `SUPERVISOR` | `app/clientes/crear/page.tsx` | Crear nuevo cliente |
| `/clientes/editar/[id]` | ✅ Sí | `ADMIN`, `SUPERVISOR` | `app/clientes/editar/[id]/page.tsx` | Editar cliente |
| `/visitas` | ✅ Sí | `PROMOTOR`, `USER` | `app/visitas/page.tsx` | Lista de visitas |
| `/visitas/[id]` | ✅ Sí | `PROMOTOR`, `USER` | `app/visitas/[id]/page.tsx` | Detalle de visita |

---

## 🔄 API CALLS DETECTED

Lista todas las llamadas fetch/axios encontradas en el proyecto:

| Frontend Route | API Endpoint Called | Method | Description |
|----------------|---------------------|--------|-------------|
| `/auth/login` | `/api/auth/login` | POST | Inicio de sesión |
| `/auth/register` | `/api/auth/register` | POST | Registro de usuario |
| `/clientes` | `/api/clients` | GET | Obtener lista de clientes |
| `/clientes/crear` | `/api/clients` | POST | Crear nuevo cliente |
| `/clientes/editar/[id]` | `/api/clients/[id]` | PUT | Actualizar cliente |
| `/clientes` (eliminar) | `/api/clients/[id]` | DELETE | Eliminar cliente |
| `/nueva-visita` | `/api/visits` | POST | Crear nueva visita |
| `/nueva-visita` | `/api/visits/images` | POST | Subir imágenes de visita |
| `/mis-visitas` | `/api/visits` | GET | Obtener visitas del usuario |
| `/visitas/[id]` | `/api/visits/[id]` | GET | Obtener detalle de visita |
| Cualquier ruta | `/api/clients` | GET | Validación de token |
| Cualquier ruta | `/health` | GET | Verificar estado del servidor backend |
| Error logging | `/api/log-error` | POST | Registrar errores del frontend |

---

## 🔍 DETECCIÓN DE INCONSISTENCIAS

### 1. Rutas que llaman APIs inexistentes
- **`/api/log-error`**: Referenciada en `lib/error-interceptor.ts` pero no se verifica existencia en backend
- **`/api/auth/profile`**: Comentada en `app/mi-perfil/page.tsx` pero no implementada

### 2. Rutas protegidas pero no en middleware
- **`/mi-perfil`**: Requiere autenticación pero no está en `protectedRoutes` del middleware
- **`/clientes/crear`**: Requiere autenticación pero no está en `protectedRoutes` del middleware
- **`/clientes/editar/[id]`**: Requiere autenticación pero no está en `protectedRoutes` del middleware

### 3. Rutas en middleware que no existen
- **`/captura`**: Está en `protectedRoutes` pero es una ruta demo de captura
- **`/clientes`**: Está en `protectedRoutes` y existe
- **`/visitas`**: Está en `protectedRoutes` y existe

### 4. Inconsistencias de RoleGuard
- **`/supervisor`**: Usa verificación manual de roles en lugar de RoleGuard
- **`/admin`**: Usa RoleGuard con `adminOnly` pero también tiene verificación en middleware
- **`/clientes`**: Usa RoleGuard con `requiredRole=['ADMIN','SUPERVISOR','PROMOTOR']` pero middleware solo verifica autenticación
- **Promotor vs USER**: En `lib/auth.ts`, `isPromotor()` retorna true para roles `PROMOTOR` o `USER`, pero en middleware solo se verifica `ADMIN`

### 5. Rutas referenciadas pero no implementadas
- **`/admin/users`**, **`/admin/reports`**, **`/admin/settings`**, **`/admin/calendar`**: Referenciadas en botones del panel admin pero no existen como rutas

### 6. Inconsistencias en protección de rutas
- **`/supervisor`**: Protegida manualmente en el componente (verifica `SUPERVISOR` o `ADMIN`)
- **`/admin`**: Protegida por middleware (verifica `ADMIN`) y por RoleGuard (`adminOnly`)
- **`/clientes`**: Protegida por middleware y RoleGuard con múltiples roles permitidos

---

## 📊 RESUMEN DE ROLES DETECTADOS

### Roles definidos en el sistema:
1. **`ADMIN`**: Acceso completo a todas las rutas
2. **`SUPERVISOR`**: Acceso a panel supervisor y gestión de clientes
3. **`PROMOTOR`**: Acceso a visitas y clientes (solo lectura en algunos casos)
4. **`USER`**: Tratado como sinónimo de `PROMOTOR` en algunas funciones

### Jerarquía de permisos:
- **ADMIN** > **SUPERVISOR** > **PROMOTOR/USER**

---

## 🛠️ RECOMENDACIONES

### 1. **Consistencia en protección de rutas**
   - Agregar `/mi-perfil`, `/clientes/crear`, `/clientes/editar/[id]` a `protectedRoutes` en middleware
   - Estandarizar uso de RoleGuard vs verificación manual

### 2. **Implementar rutas faltantes**
   - Crear rutas `/admin/users`, `/admin/reports`, `/admin/settings`, `/admin/calendar` o eliminar referencias

### 3. **Clarificar roles**
   - Definir claramente diferencia entre `PROMOTOR` y `USER`
   - Actualizar middleware para manejar todos los roles consistentemente

### 4. **API endpoints**
   - Verificar existencia de `/api/log-error` en backend
   - Implementar `/api/auth/profile` si es necesaria

### 5. **Documentación**
   - Mantener este documento actualizado con cambios en rutas
   - Documentar políticas de acceso por rol

---

## 📝 NOTAS TÉCNICAS

### Middleware (`middleware.ts`)
- **Protected routes**: `/nueva-visita`, `/visitas`, `/admin`, `/captura`, `/mis-visitas`, `/clientes`
- **Public routes**: `/`, `/auth/login`, `/auth/register`, `/health`
- **Role verification**: Solo verifica rol `ADMIN` para rutas `/admin/*`

### RoleGuard (`components/RoleGuard.tsx`)
- Soporta `adminOnly`, `promotorOnly`, `requiredRole` (string o array)
- Redirige a `/unauthorized` si no tiene permisos
- Maneja estados de carga y errores

### Autenticación (`lib/auth.ts`)
- Roles: `ADMIN`, `SUPERVISOR`, `PROMOTOR`, `USER`
- `isPromotor()` retorna true para `PROMOTOR` o `USER`
- Normalización de roles a mayúsculas

---

**Última auditoría:** 12 de febrero de 2026  
**Frontend:** Next.js 14 con App Router  
**Estado:** ✅ Documentación completa generada