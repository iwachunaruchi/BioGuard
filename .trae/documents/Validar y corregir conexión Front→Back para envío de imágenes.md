## Hipótesis
- La app Android no puede alcanzar `http://127.0.0.1:8000`; en Android, `127.0.0.1` apunta al propio dispositivo, no a tu PC.
- Uvicorn está escuchando en `127.0.0.1`, por lo que no acepta conexiones LAN.
- Adicionalmente, el backend muestra que el cliente de Supabase no se inicializa, lo que afectará la escritura en DB/Storage.

## Cambios de configuración (sin código)
1. Backend: arrancar en todas las interfaces
- `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2. Frontend: apuntar al IP LAN de tu PC
- En `bioguard/.env`: `EXPO_PUBLIC_API_BASE_URL=http://<IP_LAN_PC>:8000`
- Alternativas:
  - Android Studio Emulator: `http://10.0.2.2:8000`
  - Genymotion: `http://10.0.3.2:8000`
3. Firewall Windows
- Permitir inbound en puerto 8000 o autorizar `python.exe` de `.venv`.

## Verificaciones de red
1. Desde tu teléfono Android, abrir en el navegador `http://<IP_LAN_PC>:8000/` y ver `{"message":"BioGuard Backend is running"}`.
2. En la app, probar un GET a `/api/enroll` con método `OPTIONS` implícito (CORS ya está en `main.py`).
3. Probar POST pequeño con `image_base64` corto (cadena trivial) y confirmar 200; luego enviar una foto real.

## Supabase cliente en backend
- El mensaje `Client.__init__() got an unexpected keyword argument 'proxy'` indica un desajuste de librerías.
- Ajuste recomendado:
  - Actualizar `supabase` a la última compatible o fijar `httpx==0.24.1` (ya está) y reinstalar.
  - Si persiste, re-crear el cliente con `create_client(url, key)` sin parámetros extra (como está) y eliminar variables de entorno `HTTP_PROXY/HTTPS_PROXY` durante pruebas.

## Resultado esperado
- La app Android envía `fetch` a tu backend y recibe 200.
- Backend guarda en `face_encodings` y sube la imagen a Storage (cuando el cliente de Supabase esté inicializado).

¿Procedo a aplicar estas configuraciones, reiniciar backend con `--host 0.0.0.0`, actualizar la URL en `.env` del frontend al IP LAN, y ejecutar pruebas de conectividad y POST con imagen para cerrar el e2e?