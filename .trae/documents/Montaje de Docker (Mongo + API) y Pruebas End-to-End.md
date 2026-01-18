## Objetivo
Levantar el backend en Docker (API + MongoDB) y ejecutar pruebas end-to-end para validar todas las rutas.

## Verificación Previa
- Docker Desktop activo.
- Archivo docker-compose.yml presente en la raíz.
- Variables en .env (raíz) definidas: MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME.
- Backend con rutas en server/src/index.js y script de validación en server/scripts/validate.js.

## Cambios a Realizar
1) Crear Dockerfile para el backend en server/:
```
# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY src ./src
ENV PORT=3000
EXPOSE 3000
CMD ["node", "src/index.js"]
```

## Levantamiento
1) En la raíz del proyecto:
   - `docker compose up --build -d`
2) Verificar contenedores:
   - `docker compose ps`
   - API en http://localhost:3000, Mongo en 27017, mongo-express en http://localhost:8081
3) Logs si es necesario:
   - `docker compose logs api -f`

## Pruebas End-to-End
1) Ejecutar validador desde host:
   - `cd server`
   - `API_URL=http://localhost:3000 npm run validate`
2) El script validará:
   - Login admin, /auth/me
   - CRUD de usuarios (admin)
   - Alta/listado/borrado de personas con foto (GridFS)
   - Descarga de foto
   - Registro y lectura de logs

## Entregables
- server/Dockerfile creado.
- Contenedores corriendo y accesibles.
- Reporte del validador en consola con ✅/❌ por cada paso.

## Contingencias
- Si la API no conecta a Mongo: revisar MONGO_URI (`mongodb://mongodb:27017/bioguard`) y que el servicio `mongodb` esté arriba.
- Puertos ocupados: ajustar mapeos en docker-compose.yml.

¿Procedo a crear el Dockerfile y levantar los contenedores para ejecutar el validador?