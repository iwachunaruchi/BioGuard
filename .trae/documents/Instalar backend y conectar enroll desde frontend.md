## Objetivo
Instalar dependencias de `bioguard_back`, levantar FastAPI, y conectar el frontend para subir imágenes al endpoint `/api/enroll`.

## Backend: Instalación y arranque
1. Crear entorno virtual Python en `bioguard_back` y activar.
2. Instalar `requirements.txt` (FastAPI, Uvicorn, supabase-py, numpy, opencv-python-headless, etc.).
3. Configurar `.env` en `bioguard_back` con:
   - `SUPABASE_URL=https://eqsreqmltdnoqjmsjvyc.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=<service_role>`
   - `SUPABASE_JWT_SECRET=<jwt secret opcional>`
4. Verificar que exista bucket `faces` en Supabase Storage.
5. Arrancar API: `uvicorn app.main:app --reload --port 8000`.

## Backend: Verificación de ruta
- Probar `POST /api/enroll` con payload base64 y headers `Authorization: Bearer <token Supabase>`, confirmar que:
  - Crea user (si no se pasa user_id) con `created_by` admin
  - Sube imagen a Storage y guarda en `face_encodings`

## Frontend: Integración
1. Añadir `EXPO_PUBLIC_API_BASE_URL=http://localhost:8000` en `bioguard/.env`.
2. Crear servicio `enrollFace(base64, angle, userId?)` que haga `fetch POST /api/enroll` con `Authorization: Bearer session.access_token`.
3. En `BiometricCaptureScreen`, tras capturar cada foto:
   - Enviar base64 al backend; si `userId` no existe, crear usuario con `full_name` y `role` seleccionados.
   - Manejar respuestas y mostrar éxito/errores.

## Seguridad
- El cliente usa sólo `anon key`; el backend usa `service_role` desde `.env` del backend.
- CORS está habilitado en `app.main` para desarrollo.

## Verificación end-to-end
- Desde la app, capturar una foto y enviar al backend.
- Confirmar:
  - Nueva fila en `users` (con `created_by`)
  - Fila en `face_encodings` con `image_url`
  - Imagen accesible en Storage.

¿Procedo a instalar los requisitos del backend, configurar `.env`, arrancar FastAPI en 8000 y conectar el frontend para usar `/api/enroll`?