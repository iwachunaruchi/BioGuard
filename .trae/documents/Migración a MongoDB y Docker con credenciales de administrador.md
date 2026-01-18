## Objetivo
Implementar gestión de usuarios (admin y user), listas blanca/negra con imágenes, autenticación segura y despliegue con Docker usando MongoDB. Sembrar un administrador inicial mediante variables de entorno.

## Arquitectura
- Backend API: Node.js + Express + Mongoose + JWT + bcrypt.
- Almacenamiento de imágenes: MongoDB GridFS (persistente en volumen Docker).
- Base de datos: MongoDB.
- Opcional: Mongo Express para administración visual.
- App móvil (Expo): consumir API (axios), mantener token en SecureStore.

## Modelos de Datos
- User: { email único, passwordHash (bcrypt), name, role: 'admin'|'user', createdAt }.
- Person: { name, listType: 'whitelist'|'blacklist', photoFileId(ObjectId), createdBy(userId), createdAt, updatedAt }.
- AccessLog: { personId, action: 'access_granted'|'access_denied', timestamp, userId }.

## Endpoints
- Auth:
  - POST /auth/login → devuelve JWT.
  - POST /auth/seed (interno en startup) → crea admin si no existe.
- Users (admin):
  - GET /users
  - POST /users (role: 'user' o 'admin')
  - PATCH /users/:id
  - DELETE /users/:id
- People:
  - GET /people?search=&listType=
  - POST /people (multipart: { name, listType, photo })
  - PATCH /people/:id (editable name/listType)
  - DELETE /people/:id
  - GET /people/:id/photo (stream GridFS)
- Access Logs (admin):
  - GET /logs
  - POST /logs (cuando la app registra acceso)

## Semilla de Administrador
- En el backend, al iniciar: buscar usuario con role 'admin'. Si no existe, crear usando variables de entorno.
- Variables por defecto (modificables):
  - ADMIN_EMAIL=admin@bioguard.com
  - ADMIN_PASSWORD=admin123
  - ADMIN_NAME=Administrador Principal
  - JWT_SECRET=changeme

## Docker Compose
- Servicios:
  - api (Node/Express), depende de mongodb.
  - mongodb (oficial), con volumen.
  - mongo-express (opcional), sólo para administración.
- Ejemplo de .env (backend):
```
MONGO_URI=mongodb://mongodb:27017/bioguard
JWT_SECRET=changeme
ADMIN_EMAIL=admin@bioguard.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Administrador Principal
``` 
- Ejemplo docker-compose.yml (a generar):
```
services:
  api:
    build: ./server
    environment:
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
      - ADMIN_EMAIL=${ADMIN_EMAIL}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - ADMIN_NAME=${ADMIN_NAME}
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
  mongodb:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"
  mongo-express:
    image: mongo-express:1
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongodb
    ports:
      - "8081:8081"
    depends_on:
      - mongodb
volumes:
  mongo_data:
```

## Cambios en la App (Expo)
- Reemplazar almacenamiento local por API:
  - Crear src/services/api.ts (axios con baseURL configurable).
  - Actualizar AuthContext para usar POST /auth/login y guardar JWT en SecureStore. Referencia actual: [AuthContext.tsx](file:///d:/Sistemas%20Distribuidos/BioGuard/src/context/AuthContext.tsx).
  - Actualizar tipos: role a 'admin'|'user' (actualmente es 'admin'|'operator' en [index.ts](file:///d:/Sistemas%20Distribuidos/BioGuard/src/types/index.ts#L1-L8)).
- Personas:
  - PeopleListScreen: obtener, filtrar y eliminar vía API. Referencia actual: [PeopleListScreen.tsx](file:///d:/Sistemas%20Distribuidos/BioGuard/src/screens/PeopleListScreen.tsx).
  - AddPersonScreen: enviar multipart con foto y metadatos. Referencia actual: [AddPersonScreen.tsx](file:///d:/Sistemas%20Distribuidos/BioGuard/src/screens/AddPersonScreen.tsx).
  - CameraScreen: mantener simulación de reconocimiento por ahora; registrar logs vía API. Referencia actual: [CameraScreen.tsx](file:///d:/Sistemas%20Distribuidos/BioGuard/src/screens/CameraScreen.tsx).
- Token: seguir usando SecureStore (ya existente en [storage.ts](file:///d:/Sistemas%20Distribuidos/BioGuard/src/utils/storage.ts#L93-L117)).

## Seguridad
- Hash de contraseñas con bcrypt.
- JWT con expiración y middleware de autorización (admin-only para /users y /logs GET).
- Validación de entrada con JOI/Zod.
- Límite de tamaño para fotos y tipos permitidos.

## Reconocimiento Facial (MVP)
- Mantener reconocimiento simulado.
- Guardar fotos en GridFS y devolver su stream para visualización.
- Futuro: endpoint /recognize con proveedor externo.

## Entregables
- Directorio server/ con API (Express + Mongoose + GridFS) y scripts de seed.
- docker-compose.yml y .env de backend.
- Actualizaciones en la app: servicio API y refactors de Auth/People.
- Documentación en README para ejecución local y credenciales iniciales.

## Flujo de Ejecución
1) Crear server/ (API) con semilla de admin desde env.
2) Añadir docker-compose.yml y .env.
3) Levantar: `docker compose up --build`.
4) Configurar baseURL en la app:
   - Web/emulador Android: http://localhost:3000 o http://10.0.2.2:3000 según entorno.
5) Probar login con admin y flujo de personas.

## Confirmación
¿Confirmas esta arquitectura y que generemos el backend + compose, actualicemos la app y documentemos credenciales iniciales?