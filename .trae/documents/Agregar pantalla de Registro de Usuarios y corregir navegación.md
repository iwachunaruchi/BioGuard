## Causa
- Se navega a 'UserRegistration' desde Dashboard/Users, pero ese screen no está registrado en el stack. React Navigation advierte que no existe.

## Cambios propuestos
1. Crear `src/screens/UserRegistrationScreen.tsx`:
   - Formulario con: Nombre, Email, Rol (admin/whitelist/blacklist/visitor), 3 fotos opcionales.
   - Acciones:
     - `supabase.auth.signUp({ email, password })` para crear cuenta Auth del usuario.
     - Insertar en `users` con `id` de Auth y `role` seleccionado.
     - Si hay fotos, subir a Storage y guardar en `face_encodings` (mock encoding como placeholder).
   - Validaciones: email único, contraseña fuerte, rol requerido.

2. Registrar pantalla en el stack:
   - En `src/navigation/AppNavigator.tsx` añadir `<Stack.Screen name="UserRegistration" component={UserRegistrationScreen} />` en la rama autenticada.

3. Navegación correcta
   - Mantener `navigation.navigate('UserRegistration')` desde Dashboard/Users.
   - Si en el futuro se anida navegadores, seguir guía oficial para navegar a hijos.

4. Seguridad/RLS
   - Confirmar política de inserción en `users` permite a admins crear perfiles.
   - Mantener claves en `.env` (sólo `anon`).

## Verificación
- UI: desde Dashboard/Users abrir registro, crear usuario y observar éxito.
- Base de datos: comprobar filas nuevas en `users` y `face_encodings`.
- Storage: verificar imágenes subidas.

¿Procedo a implementar estos cambios ahora mismo?