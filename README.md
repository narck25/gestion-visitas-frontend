# Visitas Promotores - Frontend PWA

Aplicación PWA moderna para la gestión de visitas de promotores de ventas, construida con Next.js 14 y Tailwind CSS.

## 🚀 Características

- **PWA (Progressive Web App)**: Instalable como app nativa en dispositivos móviles
- **Autenticación completa**: Login y registro de usuarios
- **Gestión de visitas**: Crear, ver y gestionar visitas
- **Captura de imágenes**: Toma fotos antes/después de cada visita
- **Funcionamiento offline**: Sincronización automática cuando hay conexión
- **UI moderna**: Diseño responsivo con Tailwind CSS

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Backend API funcionando (https://api.prodevfabian.cloud)

## 🛠️ Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/narck25/gestion-visitas-frontend.git
cd gestion-visitas-frontend
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env.local
```
Editar `.env.local` y configurar:
```env
NEXT_PUBLIC_API_URL=https://api.prodevfabian.cloud
```

4. Iniciar servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

5. Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

## 👤 Autenticación

### Registro de Usuario
1. Acceder a `/auth/register` o hacer clic en "Regístrate aquí" desde el login
2. Completar el formulario con:
   - Nombre completo
   - Email válido
   - Contraseña (mínimo 6 caracteres)
   - Confirmación de contraseña
3. El sistema validará los datos y creará la cuenta
4. Redirige automáticamente al login después del registro exitoso

### Inicio de Sesión
1. Desde la página principal, hacer clic en "Iniciar Sesión"
2. Ingresar email (usuario) y contraseña
3. El sistema validará las credenciales con el backend
4. Acceso a todas las funcionalidades después del login exitoso

## 📱 Funcionalidades Principales

### 1. Gestión de Visitas
- **Nueva Visita** (`/nueva-visita`): Formulario para crear nuevas visitas
- **Lista de Visitas** (`/visitas`): Visualización de todas las visitas registradas
- **Captura de Imágenes** (`/captura`): Demo de captura de fotos con cámara

### 2. PWA Features
- Instalación como app nativa en iOS/Android
- Funcionamiento offline
- Notificaciones push (configurables)
- Actualizaciones automáticas

### 3. Autenticación
- Registro de nuevos usuarios
- Login con validación en tiempo real
- Logout seguro
- Tokens JWT para autorización

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia servidor de producción
- `npm run lint` - Ejecuta ESLint para análisis de código

## 🏗️ Estructura del Proyecto

```
gestion-visitas-frontend/
├── app/
│   ├── auth/
│   │   ├── login/      # Página de login
│   │   └── register/   # Página de registro
│   ├── captura/        # Demo de captura
│   ├── nueva-visita/   # Formulario nueva visita
│   ├── visitas/        # Lista de visitas
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Página principal
├── components/         # Componentes reutilizables
├── lib/                # Utilidades y APIs
│   ├── api.ts          # Configuración de API
│   └── auth.ts         # Lógica de autenticación
├── public/             # Archivos estáticos
└── package.json        # Dependencias y scripts
```

## 🔌 Integración con Backend

La aplicación se conecta al backend mediante la variable de entorno `NEXT_PUBLIC_API_URL`.

**Endpoints principales:**
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Autenticación de usuarios
- `GET /api/visits` - Obtener lista de visitas
- `POST /api/visits` - Crear nueva visita

## 🚀 Despliegue

### Para Coolify
1. El proyecto está configurado para despliegue en Coolify
2. Usa Nixpacks para construcción automática
3. Escucha en el puerto 3000
4. No requiere Dockerfile

### Para Vercel
1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Despliegue automático con cada push

## 🐛 Solución de Problemas

### Error de conexión con backend
1. Verificar que `NEXT_PUBLIC_API_URL` esté configurada correctamente
2. Confirmar que el backend esté funcionando
3. Revisar la consola del navegador para errores de CORS

### Problemas de autenticación
1. Verificar que el email y contraseña sean correctos
2. Limpiar localStorage si hay problemas con el token
3. Revisar la consola para mensajes de error específicos

### PWA no se instala
1. Asegurarse de usar HTTPS en producción
2. Verificar que el manifest.json esté configurado correctamente
3. Revisar la consola de DevTools > Application > Service Workers

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles.

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request
