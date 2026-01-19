## Panorama del proyecto
- Proyecto Expo SDK 54 con React Native 0.81 y React 19
- Entradas clave: scripts de Expo en [package.json](file:///d:/Sistemas%20Distribuidos/BioGuard/bioguard/package.json), configuración básica en [app.json](file:///d:/Sistemas%20Distribuidos/BioGuard/bioguard/app.json)
- Uso de Supabase con variables públicas en [supabase.ts](file:///d:/Sistemas%20Distribuidos/BioGuard/bioguard/src/config/supabase.ts) y plantilla de entorno en [.env.example](file:///d:/Sistemas%20Distribuidos/BioGuard/bioguard/.env.example)

## Objetivo
- Publicar app móvil en Android/iOS usando EAS Build
- Habilitar actualizaciones OTA con EAS Update
- (Opcional) Exportar y desplegar versión Web estática

## Prerrequisitos
- Node 18+ y Git instalados
- Cuentas activas: Expo (gratuita) y Apple Developer (para iOS), Google Play Console (para Android)
- CLI: instalar globalmente o usar npx
  - npx expo@latest
  - npx eas-cli@latest

## Estrategia de despliegue
- Móvil (EAS Build): compilar en la nube y obtener artefactos (.aab/.apk para Android, .ipa para iOS)
- OTA (EAS Update): publicar bundles JS a ramas (preview/production) sin re-subir a tiendas
- Web (opcional): exportar estáticos y subir a hosting (Netlify, Vercel, S3)

## Cambios planificados en el repositorio
1) Crear eas.json con perfiles de build y update
```json
{
  "build": {
    "preview": { "developmentClient": false, "autoIncrement": "version", "channel": "preview" },
    "production": { "developmentClient": false, "autoIncrement": "version", "channel": "production" }
  },
  "submit": {
    "android": { "service": "google-play" },
    "ios": { "service": "app-store" }
  }
}
```
2) Completar app.json
- Añadir identificadores:
  - ios.bundleIdentifier: com.suempresa.bioguard
  - android.package: com.suempresa.bioguard
- Añadir scheme para deep links: bioguard
- Añadir runtimeVersion policy y canal de updates
- (EAS añadirá extra.eas.projectId automáticamente al configurar)
```json
{
  "expo": {
    "name": "bioguard",
    "slug": "bioguard",
    "version": "1.0.0",
    "scheme": "bioguard",
    "runtimeVersion": { "policy": "nativeVersion" },
    "updates": { "url": "https://u.expo.dev" },
    "ios": { "supportsTablet": true, "bundleIdentifier": "com.suempresa.bioguard" },
    "android": { "package": "com.suempresa.bioguard", "edgeToEdgeEnabled": true, "predictiveBackGestureEnabled": false }
  }
}
```
3) Variables de entorno
- Crear .env con:
```
EXPO_PUBLIC_SUPABASE_URL=https://<su-project-id>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<su-anon-key>
```
- Mantener cualquier clave privada fuera del cliente

## Pasos de ejecución (usted los corre tras mi confirmación)
1) Inicializar EAS en el proyecto
```bash
npx eas-cli login
npx eas-cli build:configure
npx eas-cli update:configure
```
2) Android: build y envío a Play
```bash
npx eas-cli build -p android --profile production
npx eas-cli submit -p android --path <ruta-del-aab-o-apk>
```
3) iOS: build y envío a App Store
```bash
npx eas-cli build -p ios --profile production
npx eas-cli submit -p ios --path <ruta-del-ipa>
```
4) OTA updates (una vez aprobadas las builds en tienda)
```bash
npx eas-cli update --branch production --message "Primera versión"
```
5) Web (opcional)
```bash
npx expo export --platform web
# subir la carpeta dist a su hosting
```

## Verificación de calidad
- Probar login/registro con Supabase en dispositivo físico
- Verificar cámara en [BiometricCaptureScreen](file:///d:/Sistemas%20Distribuidos/BioGuard/bioguard/src/screens/BiometricCaptureScreen.tsx) y permisos
- Revisar navegación en [AppNavigator](file:///d:/Sistemas%20Distribuidos/BioGuard/bioguard/src/navigation/AppNavigator.tsx)
- Confirmar que las variables de entorno se leen correctamente desde [supabase.ts](file:///d:/Sistemas%20Distribuidos/BioGuard/bioguard/src/config/supabase.ts)

## Entregables
- eas.json con perfiles preview/production
- app.json actualizado con package/bundleIdentifier, scheme y runtimeVersion
- .env listo para producción
- Artefactos de build (.aab/.apk y .ipa) y publicación OTA

¿Confirmo este plan y procedo a aplicar los cambios y guiar la ejecución paso a paso?