import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnv(envPath) {
  const raw = fs.readFileSync(envPath, 'utf-8')
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const val = line.slice(idx + 1).trim()
    if (key) process.env[key] = val
  }
}

async function main() {
  const envPath = path.resolve(process.cwd(), '..', '.env')
  if (fs.existsSync(envPath)) {
    loadEnv(envPath)
  } else {
    console.log('No se encontró .env en', envPath)
  }

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminName = process.env.ADMIN_NAME || 'Administrador'

  if (!url || !anon) {
    console.error('Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }
  if (!adminEmail || !adminPassword) {
    console.error('Faltan ADMIN_EMAIL o ADMIN_PASSWORD')
    process.exit(2)
  }

  const supabase = createClient(url, anon, {
    auth: { autoRefreshToken: true, persistSession: false, detectSessionInUrl: false },
  })

  console.log('Intentando crear usuario admin mediante signUp...')
  const { data, error } = await supabase.auth.signUp({ email: adminEmail, password: adminPassword })
  if (error) {
    console.error('Error signUp:', error.message)
    process.exit(3)
  }

  const userId = data.user?.id
  console.log('Usuario creado:', userId)

  console.log('Insertando perfil en tabla users con rol admin...')
  const { error: upError } = await supabase
    .from('users')
    .insert([{ id: userId, full_name: adminName, role: 'admin' }])
  if (upError) {
    console.error('Error insert users:', upError.message)
    process.exit(4)
  }

  console.log('Seed de admin completado')
  process.exit(0)
}

main()

