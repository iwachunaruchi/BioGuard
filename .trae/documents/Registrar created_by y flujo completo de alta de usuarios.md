## Objetivo
Al registrar un usuario desde la app, además de crear su cuenta en Supabase Auth, guardar en la tabla `users` los campos `id`, `full_name`, `role` y `created_by` (el admin que lo crea).

## Cambios en Frontend
1. UserRegistrationScreen
- Importar `useAuth` para obtener `session.user.id` del admin.
- En `handleSubmit`, tras `auth.signUp`, insertar en `users`:
  - `{ id: userId, full_name, role, created_by: session.user.id }`.
- Mantener validaciones (contraseña/rol/campos obligatorios) y mostrar errores legibles.

2. Navegación
- Ya está registrada la pantalla en el stack; no requiere cambios adicionales.

## Políticas RLS (Supabase)
- Confirmar que la tabla `users` tiene columna `created_by`.
- Ajustar políticas para permitir a admins insertar perfiles de otros usuarios:
  - `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`
  - `CREATE POLICY "read authenticated" ON users FOR SELECT USING (auth.role() = 'authenticated');`
  - `CREATE POLICY "insert by admins" ON users FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));`
- (Opcional) mantener la política de auto-inserción propia si también se permite el auto-registro de visitantes.

## Verificación
- Flujo UI: desde Dashboard → "+ Nuevo Usuario" → completar y enviar; confirmar aviso de éxito.
- Base de datos: consultar `users` y verificar nueva fila con `created_by = admin_id`.
- UI de Usuarios: aplicar filtros por rol y ver al nuevo usuario listado.

## Seguridad
- El cliente usa sólo `EXPO_PUBLIC_SUPABASE_*` (anon key). No usar `service_role` en la app.

¿Procedo a actualizar la pantalla para insertar `created_by` y te dejo el SQL de políticas listo para aplicar en Supabase?