# BioGuard Backend - Rutas y Validación

## Autenticación
- POST /auth/login
  - Público
  - Body: { email: string, password: string }
  - Respuestas:
    - 200 { token: string }
    - 401 { message: 'Invalid credentials' }
  - Uso:
    - Devuelve un JWT para usar en Authorization: Bearer <token>

- GET /auth/me
  - Requiere JWT
  - Headers: Authorization: Bearer <token>
  - Respuestas:
    - 200 { id, email, name, role: 'admin'|'user', createdAt }
    - 401
  - Uso:
    - Obtiene el perfil del usuario autenticado

## Usuarios (solo admin)
- GET /users
  - Requiere JWT y rol admin
  - Respuestas: 200 Array<{ id, email, name, role, createdAt }>, 403/401
  - Uso: Lista todos los usuarios

- POST /users
  - Requiere JWT y rol admin
  - Body: { email, password, name, role: 'admin'|'user' }
  - Respuestas:
    - 201 { id, email, name, role, createdAt }
    - 400/409 según validación futura
  - Uso: Crea un nuevo usuario

- PATCH /users/:id
  - Requiere JWT y rol admin
  - Body: { name?, role?: 'admin'|'user', password? }
  - Respuestas:
    - 200 { id, email, name, role, createdAt }
    - 404 si no existe
  - Uso: Actualiza datos de usuario

- DELETE /users/:id
  - Requiere JWT y rol admin
  - Respuestas: 204, 404 si no existe
  - Uso: Elimina usuario

## Personas (listas blanca/negra)
- GET /people?search=&listType=
  - Requiere JWT
  - Query:
    - search (opcional): texto para filtrar por nombre
    - listType (opcional): 'whitelist'|'blacklist'
  - Respuestas:
    - 200 Array<{ id, name, listType, photoFileId, createdBy, createdAt, updatedAt }>
  - Uso: Listado y filtrado de personas

- POST /people
  - Requiere JWT
  - Content-Type:
    - JSON: { name, listType: 'whitelist'|'blacklist', photoBase64 }
    - También soporta multipart/form-data con campo 'photo'
  - Respuestas:
    - 201 { id }
    - 400 { message: 'Photo required' } si falta imagen
  - Uso: Crea persona; la foto se guarda en GridFS

- PATCH /people/:id
  - Requiere JWT
  - Body: { name?, listType?: 'whitelist'|'blacklist' }
  - Respuestas:
    - 200 objeto persona actualizado
    - 404 si no existe
  - Uso: Actualiza datos de persona

- DELETE /people/:id
  - Requiere JWT
  - Respuestas: 204
  - Uso: Elimina persona y su foto en GridFS

- GET /people/:id/photo
  - Requiere JWT
  - Respuesta: 200 stream image/jpeg
  - Uso: Descargar la foto desde GridFS

## Logs de Acceso
- GET /logs
  - Requiere JWT y rol admin
  - Respuestas: 200 Array<{ id, personId, action, timestamp, userId }>
  - Uso: Consulta de registros de acceso

- POST /logs
  - Requiere JWT
  - Body: { personId: string, action: 'access_granted'|'access_denied' }
  - Respuestas: 201 { id }
  - Uso: Registrar evento de acceso

## Requisitos de Autorización
- Middleware authMiddleware: valida JWT en Authorization: Bearer <token>
- Middleware adminOnly: restringe a role 'admin' en endpoints de usuarios y lectura de logs

## Errores Comunes
- 401: Falta o token inválido
- 403: Usuario sin permisos (no admin)
- 404: Recurso no encontrado
- 400: Validación (p.ej., falta foto en creación de persona)

## Validación Automatizada (resumen)
1. Login admin → obtener token
2. /auth/me → validar respuesta
3. Crear usuario (user) → listar usuarios
4. Crear persona (base64) → listar, filtrar por whitelist/blacklist
5. Obtener foto → comprobar image/jpeg
6. Crear log → listar logs (admin)
7. Borrar persona y usuario → validar 204

Referencia de implementación: [index.js](file:///d:/Sistemas%20Distribuidos/BioGuard/server/src/index.js)
