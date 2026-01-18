# Diagnóstico
- El error "AbortError: signal is aborted without reason" aparece en AuthContext y UsersScreen. Suele deberse a peticiones canceladas por re-render, desmontaje de componentes o navegación.
- Se observan dos fuentes: llamadas duplicadas a fetchUserProfile (checkUser + onAuthStateChange) y carga de usuarios que se dispara en cada cambio de filtros sin cancelar la anterior.
- La advertencia de navegación (REPLACE 'Dashboard' no manejado) indica transiciones fallidas que pueden desmontar componentes durante peticiones.

# Plan de Corrección
## 1. AuthContext
- Evitar llamadas duplicadas:
  - Usar solo onAuthStateChange para sincronizar session y llamar fetchUserProfile una vez.
  - checkUser solo inicializa session, sin duplicar fetch si ya hay sesión y el listener lo hará.
- Añadir guardas de concurrencia:
  - requestId/inFlight para ignorar respuestas antiguas.
  - isMounted y cleanup en useEffect para no setear estado tras un desmontaje.
- Manejar AbortError:
  - Capturar AbortError en getSession y fetchUserProfile; loguear y continuar sin romper flujo.

## 2. UsersScreen
- Debounce y cancelación:
  - Añadir requestId y cleanup en useEffect para cancelar cargas previas cuando cambian search/role.
  - Pequeño debounce (150–250ms) antes de consultar para evitar ráfagas.
- Manejar AbortError en getUsers/getUsersRPC (ya se añadió reintento); reforzar con cleanup para no actualizar estado si el efecto se canceló.

## 3. Navegación
- Validar que la ruta 'Dashboard' existe; si no, usar el nombre correcto o navigation.navigate en vez de replace.
- Esto evita desmontajes inesperados durante peticiones.

## 4. Verificación
- Registrar logs estructurados (inicio/fin/abort/stale) en ambas capas.
- Ejecutar los scripts de prueba existentes (test-auth.mjs, test-users.mjs, opcional test-users-rpc.mjs) para validar consultas sin AbortError.
- Probar manualmente flujos de login y carga de usuarios con cambios de filtros rápidos.

¿Quieres que aplique estas correcciones ahora? Se mantendrá la consulta de usuarios vía Supabase (RPC con fallback) y no se tocará tu API de backend.