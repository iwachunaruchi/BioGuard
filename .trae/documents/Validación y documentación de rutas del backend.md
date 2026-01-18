## Objetivo
Auditar y validar todas las rutas del backend actual y crear una documentación clara en un archivo Markdown.

## Alcance
- Rutas en [index.js](file:///d:/Sistemas%20Distribuidos/BioGuard/server/src/index.js):
  - Auth: POST /auth/login, GET /auth/me
  - Usuarios (admin): GET/POST/PATCH/DELETE /users
  - Personas: GET/POST/PATCH/DELETE /people, GET /people/:id/photo
  - Logs: GET (admin)/POST /logs
  - Middleware: authMiddleware (JWT) y adminOnly

## Entregables
1) Archivo docs/backend-routes.md con:
- Descripción por ruta (método, path, auth requerida, rol, propósito)
- Request payload y headers
- Respuesta (estructura, códigos HTTP)
- Ejemplos de uso
- Errores comunes

2) Script de validación automática (server/scripts/validate.js):
- Iniciar sesión (admin) y obtener token
- Probar /auth/me
- Crear usuario (role user), listar usuarios
- Crear persona con foto base64, listar y filtrar
- Obtener foto (stream HEAD)
- Crear log y listar logs (admin)
- Borrado de persona y usuario
- Reporte en consola con estado por prueba

3) Añadir npm script "validate" en server/package.json para ejecutar el validador.

## Flujo
1) Crear docs/backend-routes.md con toda la documentación de endpoints.
2) Implementar server/scripts/validate.js y agregar script npm.
3) (Opcional) Ejecutar con Docker: `docker compose up --build -d` y luego `npm run validate` en server.

## Muestra de Documentación (extracto)
### POST /auth/login
- Auth: pública
- Body: `{ email: string, password: string }`
- Respuesta: `200 { token: string }` / `401 { message: 'Invalid credentials' }`

### GET /auth/me
- Auth: JWT
- Headers: `Authorization: Bearer <token>`
- Respuesta: `200 { id, email, name, role, createdAt }` / `401`

### POST /people
- Auth: JWT
- Body JSON (app): `{ name, listType: 'whitelist'|'blacklist', photoBase64 }`
- Respuesta: `201 { id }` / `400 { message: 'Photo required' }`

## Confirmación
¿Confirmas que procedamos a crear docs/backend-routes.md y el script de validación para ejecutar las pruebas automatizadas de todas las rutas?