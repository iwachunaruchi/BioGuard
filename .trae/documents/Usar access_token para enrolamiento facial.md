# Objetivo
Integrar y verificar el envío de imágenes al backend usando el access_token obtenido en el login, incluyendo nombre (full_name), rol y que el backend registre al administrador que crea.

## Confirmar Configuración
- Asegurar EXPO_PUBLIC_API_BASE_URL apunta al backend (por ejemplo, https://tu-backend.com).
- Iniciar sesión con Supabase para obtener session.access_token.

## Uso en Frontend
- Obtener el token desde useAuth: session.access_token.
- Invocar enrollService.enrollFace(payload, session.access_token) con:
  - image_base64: foto en base64 (puede incluir prefijo data:image/jpeg;base64,).
  - angle_type: "front" | "left" | "right".
  - user_id: opcional (si existe el usuario).
  - full_name y role: requeridos si se crea un usuario nuevo.

## Escenarios de Payload
- Usuario existente: enviar user_id + image_base64 + angle_type (full_name/role opcionales).
- Crear usuario en el backend: omitir user_id y enviar full_name + role; el backend usará admin_id del token (current_user['sub']) en created_by.

## Pruebas Manuales
- Probar desde BiometricCaptureScreen: ya pasa session.access_token y datos del usuario.
- Prueba con curl:
  - Authorization: Bearer <token>.
  - Body JSON con image_base64, angle_type, full_name, role.

## Resultados Esperados
- 200 con { status: "ok", user_id, admin_id }.
- En DB: nuevo usuario cuando no se envía user_id, con created_by = admin_id.

¿Confirmas que procedamos a verificar y, si hace falta, ajustar las pantallas para cubrir ambos escenarios?