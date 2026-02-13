# 📊 ROUTES AUDIT REPORT

## 📅 Fecha de Auditoría
12 de febrero de 2026

## 🎯 Objetivo
Comparar ROUTES_FRONTEND.md y ROUTES_BACKEND.md para identificar inconsistencias, endpoints faltantes, y posibles problemas.

---

## 1. 🔴 ENDPOINTS DEL FRONTEND QUE NO EXISTEN EN BACKEND

### 1.1 Endpoints API Referenciados pero No Implementados

| Endpoint | Método | Ubicación Frontend | Estado Backend | Riesgo |
|----------|--------|-------------------|----------------|---------|
| `/api/log-error` | POST | `lib/error-interceptor.ts` | ❌ NO EXISTE | **ALTO** - Errores no se registrarán |
| `/api/auth/profile` | GET | Comentado en `app/mi-perfil/page.tsx` | ✅ EXISTE (GET `/api/auth/profile`) | **BAJO** - Solo comentado |

### 1.2 Inconsistencias de Parámetros
- **Frontend**: `/api/clients/[id]` (con corchetes para Next.js dynamic routes)
- **Backend**: `/api/clients/:id` (con dos puntos para Express)
- **Estado**: ✅ Compatible (Next.js convierte `[id]` a parámetro real)

---

## 2. 🔵 ENDPOINTS BACKEND QUE NO SON CONSUMIDOS POR FRONTEND

### 2.1 Autenticación
| Endpoint | Método | Descripción Backend | Razón Posible |
|----------|--------|-------------------|---------------|
| `/api/auth/refresh-token` | POST | Refrescar token de acceso | Token refresh no implementado en frontend |
| `/api/auth/logout` | POST | Cerrar sesión | Logout manejado localmente |
| `/api/auth/profile` | PUT | Actualizar perfil | Perfil solo lectura en frontend |

### 2.2 Clientes
| Endpoint | Método | Descripción Backend | Razón Posible |
|----------|--------|-------------------|---------------|
| `/api/clients/stats` | GET | Estadísticas de clientes | Panel de estadísticas no implementado |
| `/api/clients/:id` | GET | Obtener cliente específico | Solo se usa lista completa en frontend |

### 2.3 Visitas
| Endpoint | Método | Descripción Backend | Razón Posible |
|----------|--------|-------------------|---------------|
| `/api/visits/stats` | GET | Estadísticas de visitas | Panel de estadísticas no implementado |
| `/api/visits/:id` | PUT | Actualizar visita | Solo creación y lectura en frontend |
| `/api/visits/:id` | DELETE | Eliminar visita | No hay funcionalidad de eliminar |
| `/api/visits/images/:id` | GET | Obtener visita con imágenes | Solo subida de imágenes implementada |

### 2.4 Supervisor (COMPLETAMENTE NO UTILIZADO)
| Endpoint | Método | Descripción Backend |
|----------|--------|-------------------|
| `/api/supervisor/promoters` | GET | Obtener promotores asignados |
| `/api/supervisor/clients` | GET | Obtener clientes de promotores |
| `/api/supervisor/visits` | GET | Obtener visitas de promotores |
| `/api/supervisor/stats` | GET | Estadísticas de supervisión |
| `/api/supervisor/promoters/assign` | POST | Asignar promotor |
| `/api/supervisor/promoters/:promoterId/unassign` | DELETE | Desasignar promotor |

### 2.5 Admin (COMPLETAMENTE NO UTILIZADO)
| Endpoint | Método | Descripción Backend |
|----------|--------|-------------------|
| `/api/admin/users` | GET | Obtener todos los usuarios |
| `/api/admin/clients` | GET | Obtener todos los clientes |
| `/api/admin/visits` | GET | Obtener todas las visitas |
| `/api/admin/stats` | GET | Estadísticas del sistema |
| `/api/admin/users/:userId/role` | PATCH | Actualizar rol de usuario |
| `/api/admin/users/:userId/status` | PATCH | Activar/desactivar usuario |

### 2.6 Health & System
| Endpoint | Método | Descripción Backend |
|----------|--------|-------------------|
| `/health/liveness` | GET | Liveness probe |
| `/health/readiness` | GET | Readiness probe |
| `/` | GET | Información de la API |
| `/uploads/*` | GET | Archivos subidos |

**Total endpoints backend no utilizados: 24 de 37 (65%)**

---

## 3. 🛡️ RUTAS PROTEGIDAS INCONSISTENTES

### 3.1 Frontend vs Middleware Protection
| Ruta Frontend | Protegida en Frontend | En `protectedRoutes` (middleware.ts) | Inconsistencia |
|---------------|----------------------|--------------------------------------|----------------|
| `/mi-perfil` | ✅ Sí (todos los roles) | ❌ NO | **ALTA** - Acceso sin autenticación posible |
| `/clientes/crear` | ✅ Sí (ADMIN, SUPERVISOR) | ❌ NO | **ALTA** - Acceso sin autenticación posible |
| `/clientes/editar/[id]` | ✅ Sí (ADMIN, SUPERVISOR) | ❌ NO | **ALTA** - Acceso sin autenticación posible |
| `/captura` | ✅ Sí (PROMOTOR, USER) | ✅ Sí | ✅ Consistente |
| `/supervisor` | ✅ Sí (SUPERVISOR, ADMIN) | ❌ NO (pero verifica rol en componente) | **MEDIA** - Protección solo en componente |

### 3.2 Inconsistencias de Roles
| Sistema | Rol Promotor | Rol Usuario | Inconsistencia |
|---------|--------------|-------------|----------------|
| **Frontend** | `PROMOTOR` | `USER` (tratado como PROMOTOR) | Roles diferentes |
| **Backend** | `PROMOTER` (con E) | No existe `USER` | **CRÍTICA** - Diferente ortografía |

**Problema Principal**: Frontend usa `PROMOTOR` mientras backend espera `PROMOTER`. Esto causará errores de autorización.

### 3.3 Jerarquía de Roles Inconsistente
- **Frontend**: `ADMIN` > `SUPERVISOR` > `PROMOTOR/USER`
- **Backend**: `SUPER_ADMIN` > `ADMIN` > `SUPERVISOR` > `PROMOTER`
- **Inconsistencia**: Backend tiene `SUPER_ADMIN` que no existe en frontend

---

## 4. ⚠️ POSIBLES ERRORES 404 FUTUROS

### 4.1 Rutas Referenciadas pero No Implementadas
| Ruta Frontend | Referenciada en | Estado | Riesgo 404 |
|---------------|----------------|--------|------------|
| `/admin/users` | `app/admin/page.tsx` (botón) | ❌ NO EXISTE | **ALTO** |
| `/admin/reports` | `app/admin/page.tsx` (botón) | ❌ NO EXISTE | **ALTO** |
| `/admin/settings` | `app/admin/page.tsx` (botón) | ❌ NO EXISTE | **ALTO** |
| `/admin/calendar` | `app/admin/page.tsx` (botón) | ❌ NO EXISTE | **ALTO** |

### 4.2 APIs que Podrían Fallar
| API Endpoint | Método | Razón del Potencial 404 |
|--------------|--------|-------------------------|
| `/api/log-error` | POST | No existe en backend - error silencioso |
| Cualquier ruta con `PROMOTOR` | Cualquiera | Backend espera `PROMOTER` (con E) |

### 4.3 Rutas Dinámicas sin Validación
- `/clientes/editar/[id]` - No hay validación si el ID existe
- `/visitas/[id]` - No hay validación si la visita existe o es accesible

---

## 5. 📈 RESUMEN DE COHERENCIA GENERAL

### 5.1 Métricas de Coherencia
| Categoría | Total | Coherentes | Incoherentes | % Coherencia |
|-----------|-------|------------|--------------|--------------|
| Endpoints API | 12 | 10 | 2 | 83% |
| Rutas Protegidas | 8 | 4 | 4 | 50% |
| Roles del Sistema | 4 | 1 | 3 | 25% |
| **General** | **24** | **15** | **9** | **63%** |

### 5.2 Nivel de Riesgo General
- **ALTO**: 4 issues (17%)
- **MEDIO**: 3 issues (13%)
- **BAJO**: 2 issues (8%)

### 5.3 Principales Hallazgos Críticos

1. **🚨 CRÍTICO**: Inconsistencia `PROMOTOR` (frontend) vs `PROMOTER` (backend)
   - Impacto: Errores de autorización en todas las rutas de promotor
   - Solución: Estandarizar a `PROMOTER` (con E) en todo el sistema

2. **🔴 ALTO**: Endpoint `/api/log-error` no existe
   - Impacto: Errores del frontend no se registran
   - Solución: Implementar endpoint o remover referencia

3. **🔴 ALTO**: Rutas `/mi-perfil`, `/clientes/crear`, `/clientes/editar/[id]` no en middleware
   - Impacto: Acceso sin autenticación posible
   - Solución: Agregar a `protectedRoutes` en middleware.ts

4. **🟡 MEDIO**: 24 endpoints backend no utilizados (65%)
   - Impacto: Código muerto, mantenimiento innecesario
   - Solución: Evaluar si se necesitan o remover

5. **🟡 MEDIO**: Rutas `/admin/*` referenciadas pero no implementadas
   - Impacto: Errores 404 al hacer clic en botones
   - Solución: Implementar rutas o remover botones

### 5.4 Recomendaciones Prioritarias

#### PRIORIDAD 1 (Crítico - Resolver inmediatamente)
1. **Corregir inconsistencia de roles**: Cambiar `PROMOTOR` a `PROMOTER` en frontend
2. **Proteger rutas faltantes**: Agregar `/mi-perfil`, `/clientes/crear`, `/clientes/editar/[id]` a middleware
3. **Implementar o remover `/api/log-error`**: Decidir si se necesita logging de errores

#### PRIORIDAD 2 (Alto - Resolver en siguiente sprint)
1. **Implementar rutas `/admin/*` faltantes** o **remover referencias**
2. **Evaluar endpoints backend no utilizados**: ¿Se necesitan para futuras features?
3. **Agregar validación de IDs** en rutas dinámicas

#### PRIORIDAD 3 (Medio - Mejoras a largo plazo)
1. **Implementar refresh token** para mejor seguridad
2. **Consolidar sistema de roles** (agregar `SUPER_ADMIN` si es necesario)
3. **Implementar funcionalidad supervisor** o remover endpoints

---

## 6. 📋 CHECKLIST DE ACCIONES

### 6.1 Correcciones Inmediatas
- [ ] Cambiar `PROMOTOR` → `PROMOTER` en todo el frontend
- [ ] Agregar rutas faltantes a `protectedRoutes` en middleware.ts
- [ ] Decidir sobre `/api/log-error` (implementar o remover)

### 6.2 Mejoras Corto Plazo
- [ ] Implementar rutas `/admin/users`, `/admin/reports`, etc. O remover botones
- [ ] Agregar validación de existencia de IDs en rutas dinámicas
- [ ] Documentar sistema de roles consistente

### 6.3 Optimizaciones Largo Plazo
- [ ] Evaluar y posiblemente remover endpoints backend no utilizados
- [ ] Implementar refresh token mechanism
- [ ] Completar funcionalidad supervisor o remover endpoints

---

## 7. 🔧 HERRAMIENTAS DE MONITOREO SUGERIDAS

1. **Middleware de logging**: Registrar todas las llamadas API 404
2. **Health checks**: Monitorear `/health`, `/health/liveness`, `/health/readiness`
3. **Error tracking**: Implementar servicio de logging centralizado
4. **API documentation**: Usar Swagger/OpenAPI para mantener sincronizados frontend/backend

---

**Auditoría realizada por**: Sistema de Análisis de Rutas  
**Última actualización**: 12 de febrero de 2026  
**Próxima auditoría recomendada**: 1 mes (después de implementar correcciones críticas)

---
*Nota: Esta auditoría solo analiza la documentación de rutas. Se recomienda validar con pruebas de integración reales.*