## Diagnóstico
- 401 indica que el backend no recibe/acepta el Bearer token.
- Tu token ES256 con `kid` debe validarse contra JWKS: el backend ya descarga `JWKS_URL` y decodifica.
- Causas típicas: sin header Authorization, token vacío/expirado, URL incorrecta (LAN), o JWKS inaccesible.

## Verificación rápida
1. En la app, inspeccionar el token antes de llamar a /api/enroll.
- Asegurar que `session?.access_token` existe y no expiró.
- Log temporal: `console.log('token', session?.access_token?.slice(0,20))`.
2. Probar llamada directa con curl desde tu PC (sustituye IP y token):
- `curl -X POST http://<IP_LAN_PC>:8000/api/enroll -H "Authorization: Bearer <ACCESS_TOKEN>" -H "Content-Type: application/json" -d '{"image_base64":"data:image/jpeg;base64,/9j...","angle_type":"front","user_id":"<uuid>"}'`
- Debe devolver 200 o un error de negocio (p.ej. rostro no detectado).
3. Probar desde el emulador/dispositivo (navegador) que el backend responde en `http://<IP_LAN_PC>:8000/`.

## Ajustes propuestos (Frontend)
- En `enrollService.enrollFace(...)` ya mando `Authorization: Bearer ${accessToken}`. Refuerzos:
1. Si `!accessToken`, lanzar error explícito y no llamar.
2. Asegurar que la URL usa `http://<IP_LAN_PC>:8000` o `http://10.0.2.2:8000` (emulador Android).
3. Añadir manejo de `fetch` con timeout y logs de red.

## Ajustes propuestos (Backend)
- Lanzar Uvicorn en `0.0.0.0:8000` (ya está).
- Validar que `JWKS_URL` retorna correctamente (sin firewall):
  - `curl https://<PROJECT>.supabase.co/auth/v1/.well-known/jwks`
- Si el 401 persiste, añadir log de header Authorization y `kid/alg` para seguimiento.

## Resultado esperado
- La app envía el Bearer token y el backend responde 200 en /api/enroll.
- Si el token expira, el backend retornará 401; la app deberá refrescar sesión.

¿Procedo a aplicar los cambios front (comprobación de token y timeout) y a darte el comando curl listo para probar con tu token actual?