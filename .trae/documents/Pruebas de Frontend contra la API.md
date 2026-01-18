## Objetivo
Validar que el frontend (src/) se comunica correctamente con la API mediante pruebas automatizadas.

## Alcance de pruebas
- ApiService: login, me, CRUD básico de personas y logs contra backend en Docker.
- AuthContext: flujo de login y obtención de usuario usando JWT, mockeando SecureStore.

## Implementación
1) Configurar Jest con jest-expo y Testing Library.
2) Añadir babel.config.js y preset en package.json.
3) Crear pruebas:
   - src/__tests__/api.integration.test.ts
   - src/__tests__/authcontext.integration.test.tsx
4) Ejecutar `npm test` con backend levantado.

## Requisitos
- Backend activo en http://localhost:3000 (Docker Compose ya montado).

## Entregables
- Configuración de tests y reporte de ejecución con resultados ✅/❌.

¿Procedo a configurar Jest/jest-expo y crear/ejecutar las pruebas de integración en el frontend?