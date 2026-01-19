# BioGuard - Sistema de Control de Acceso Biométrico

Una aplicación móvil de escaneo biométrico facial que permite el control de acceso mediante reconocimiento facial, desarrollada con Expo, React Native y Supabase.

## 🚀 Características

- **Autenticación segura**: Login y registro con email y contraseña
- **Gestión de usuarios**: Administración completa de usuarios con diferentes roles
- **Captura biométrica**: Toma de fotos faciales para reconocimiento
- **Control de acceso**: Sistema de logs para registrar entradas y salidas
- **Filtros avanzados**: Búsqueda y filtrado por nombre y estado de usuario

## 📱 Pantallas Principales

1. **Login**: Autenticación de usuarios
2. **Registro**: Creación de nuevos usuarios (rol visitante)
3. **Dashboard**: Panel principal con estadísticas y acceso a funciones
4. **Gestión de Usuarios**: Lista, filtrado y administración de usuarios
5. **Captura Biométrica**: Toma de fotos faciales para encodings

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React Native + Expo SDK
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **Lenguaje**: TypeScript
- **Estado**: React Context API
- **Navegación**: React Navigation

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Expo CLI
- Cuenta de Supabase

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [url-del-repositorio]
   cd bioguard
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Supabase**
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Copia las credenciales del proyecto (URL y anon key)
   - Actualiza el archivo `src/config/supabase.ts` con tus credenciales

4. **Configurar la base de datos**
   - Ejecuta las sentencias SQL proporcionadas en los archivos de migración
   - Asegúrate de crear las tablas `users`, `face_encodings` y `access_logs`
   - Configura las políticas RLS según los archivos SQL

5. **Iniciar la aplicación**
   ```bash
   npm start
   # o
   expo start
   ```

## 📊 Estructura de la Base de Datos

### Tabla `users`
- `id`: UUID (Primary Key)
- `full_name`: Text
- `role`: Enum ('admin', 'whitelist', 'blacklist', 'visitor')
- `created_at`: Timestamp

### Tabla `face_encodings`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `encoding`: JSONB (vectores faciales)
- `angle_type`: Text ('front', 'left', 'right', 'up', 'down')
- `image_url`: Text

### Tabla `access_logs`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key, nullable)
- `detected_name`: Text
- `access_granted`: Boolean
- `timestamp`: Timestamp

## 🎯 Roles de Usuario

- **Admin**: Gestión completa del sistema
- **Whitelist**: Acceso permitido al sistema
- **Blacklist**: Acceso denegado al sistema
- **Visitor**: Acceso básico, puede ser escaneado

## 📱 Uso de la Aplicación

### Para Administradores:
1. Inicia sesión con credenciales de admin
2. Accede al dashboard principal
3. Gestiona usuarios (crear, editar, eliminar)
4. Captura fotos biométricas de los usuarios
5. Monitorea los logs de acceso

### Para Usuarios Visitantes:
1. Regístrate con tu email y contraseña
2. Espera la aprobación del administrador
3. Accede según el rol asignado

## 🔒 Seguridad

- Autenticación mediante Supabase Auth
- Políticas RLS (Row Level Security) en la base de datos
- Encriptación de contraseñas
- Control de acceso basado en roles

## 🚀 Despliegue

### Despliegue con EAS (Expo Application Services)

1. Autenticarse y configurar el proyecto
   ```bash
   npx eas-cli login
   npx eas-cli build:configure
   npx eas-cli update:configure
   ```
2. Construir Android (producción)
   ```bash
   npx eas-cli build -p android --profile production
   ```
3. Construir iOS (producción)
   ```bash
   npx eas-cli build -p ios --profile production
   ```
4. Enviar a tiendas
   ```bash
   npx eas-cli submit -p android --path <ruta-del-aab-o-apk>
   npx eas-cli submit -p ios --path <ruta-del-ipa>
   ```

### Actualizaciones OTA (EAS Update)
```bash
npx eas-cli update --branch production --message "Primera versión"
```

### Web (opcional)
```bash
npx expo export --platform web
# sube la carpeta dist a tu hosting (Netlify/Vercel/S3)
```

## ✅ Checklist de verificación antes de publicar
- Variables de entorno cargan correctamente en [supabase.ts](file:///d:/Sistemas%20Distribuidos/BioGuard/bioguard/src/config/supabase.ts) (URL y anon key)
- Login y registro funcionan contra Supabase
- Cámara y permisos operativos en [BiometricCaptureScreen](file:///d:/Sistemas%20Distribuidos/BioGuard/bioguard/src/screens/BiometricCaptureScreen.tsx)
- Navegación estable en [AppNavigator](file:///d:/Sistemas%20Distribuidos/BioGuard/bioguard/src/navigation/AppNavigator.tsx)

### Despliegue de Supabase
- Las funciones y políticas ya están configuradas
- Asegúrate de configurar correctamente los buckets de almacenamiento

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
