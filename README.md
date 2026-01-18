# BioGuard - Sistema de Control de Acceso Biométrico

Aplicación móvil desarrollada con Expo React Native para gestionar el control de acceso mediante captura facial y listas blancas/negras.

## Características

- ✅ **Autenticación segura** con Expo SecureStore
- 📷 **Captura facial** con detección de rostros
- 📝 **Gestión de listas** (whitelist/blacklist)
- 🔍 **Búsqueda y filtrado** de personas
- 📊 **Registro de accesos** con logs detallados
- 🔒 **Almacenamiento local** con AsyncStorage
- 📱 **Interfaz mobile-first** optimizada

## Instalación

1. **Clonar el repositorio**
```bash
git clone [url-del-repositorio]
cd BioGuard
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Instalar Expo CLI** (si no está instalado)
```bash
npm install -g @expo/cli
```

4. **Iniciar el proyecto**
```bash
npm start
```

## Credenciales por defecto

- **Email:** admin@bioguard.com
- **Contraseña:** admin123

## Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── context/        # Contextos de React (Auth)
├── navigation/     # Configuración de navegación
├── screens/        # Pantallas de la aplicación
├── types/          # Definiciones TypeScript
└── utils/          # Utilidades y servicios
```

## Tecnologías Utilizadas

- **React Native + Expo SDK**
- **TypeScript** para type safety
- **React Navigation** para navegación
- **Expo SecureStore** para credenciales seguras
- **AsyncStorage** para datos locales
- **Expo Camera** para captura facial

## Funcionalidades

### 🔐 Autenticación
- Login seguro con Expo SecureStore
- Gestión de sesión persistente
- Diferenciación de roles (admin/operator)

### 📷 Captura Facial
- Cámara con detección de rostros
- Overlay guía para posicionamiento
- Captura en alta calidad (base64)

### 👥 Gestión de Personas
- Agregar/eliminar personas
- Asignar a lista blanca o negra
- Búsqueda por nombre
- Filtrado por tipo de lista

### 📊 Control de Acceso
- Verificación automática en listas
- Registro de eventos (acceso permitido/denegado)
- Logs con timestamp y usuario

## Scripts Disponibles

- `npm start` - Iniciar servidor de desarrollo
- `npm run android` - Ejecutar en Android
- `npm run ios` - Ejecutar en iOS (requiere Mac)
- `npm run web` - Ejecutar en navegador

## Seguridad

- Las credenciales se almacenan de forma segura con Expo SecureStore
- Los datos sensibles están protegidos con encriptación
- Validación de entrada en todos los formularios

## Notas de Desarrollo

- La aplicación funciona completamente offline
- Los datos se almacenan localmente en el dispositivo
- En producción, se recomienda implementar hash de contraseñas (bcrypt)
- El reconocimiento facial es simulado - en producción requeriría una API real

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.