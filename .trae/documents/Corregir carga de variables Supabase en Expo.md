## Causa
- Expo carga variables desde el raíz del proyecto (bioguard), no desde la carpeta padre.
- Tu .env actual está en d:\Sistemas Distribuidos\BioGuard\.env, por eso `process.env.EXPO_PUBLIC_SUPABASE_URL` llega vacío y aparece “supabaseUrl is required”.

## Solución
1. Crear `bioguard/.env` con:
   - `EXPO_PUBLIC_SUPABASE_URL=https://eqsreqmltdnoqjmsjvyc.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY=<tu anon key>`
2. Reiniciar el servidor de Expo (`Ctrl+C` y `npx expo start --web`) para que el bundler inyecte las variables.
3. Añadir validación defensiva en `src/config/supabase.ts` para mostrar un error claro si faltan variables.
4. Opcional: definir `extra` en `app.json` y leer con `expo-constants` como respaldo si alguna variable faltara.

## Verificación
- UI: probar registro/login desde la pantalla y confirmar sesión creada.
- Script: ejecutar `node scripts/test-auth.mjs` para validar login con `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
- Logs: comprobar que no aparecen 400 de signup ni el error “supabaseUrl is required”.

## Seguridad
- Mantener sólo `anon key` en `.env` del cliente. No incluir `service_role`. 

¿Procedo a crear `bioguard/.env`, reiniciar Expo y aplicar la validación defensiva?