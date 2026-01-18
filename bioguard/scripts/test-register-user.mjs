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

function randomEmail() {
  const stamp = Date.now()
  return `bioguard.test.${stamp}@example.com`
}

async function main() {
  const envPath = path.resolve(process.cwd(), '..', '.env')
  if (fs.existsSync(envPath)) loadEnv(envPath)
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!url || !anon) {
    console.error('Faltan variables EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }
  if (!adminEmail || !adminPassword) {
    console.error('Faltan ADMIN_EMAIL o ADMIN_PASSWORD')
    process.exit(2)
  }

  const supabaseAdmin = createClient(url, anon, {
    auth: { autoRefreshToken: true, persistSession: false, detectSessionInUrl: false },
  })
  const supabasePublic = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })

  const login = await supabaseAdmin.auth.signInWithPassword({ email: adminEmail, password: adminPassword })
  if (login.error) {
    console.error('Login admin falló:', login.error.message)
    process.exit(3)
  }
  const adminId = login.data.user?.id
  const email = randomEmail()
  const password = 'TestUser#1234'
  const fullName = 'Usuario de Prueba'
  const role = 'visitor'

  const signup = await supabasePublic.auth.signUp({ email, password })
  if (signup.error) {
    console.error('SignUp falló:', signup.error.message)
    process.exit(4)
  }
  const newUserId = signup.data.user?.id
  if (!newUserId) {
    console.error('SignUp no devolvió user.id')
    process.exit(5)
  }

  const insert = await supabaseAdmin.from('users').insert([{ id: newUserId, full_name: fullName, role, created_by: adminId }])
  if (insert.error) {
    console.error('Insert users falló:', insert.error.message)
    process.exit(6)
  }

  const verify = await supabaseAdmin.from('users').select('id, full_name, role, created_by').eq('id', newUserId).single()
  if (verify.error) {
    console.error('Verificación falló:', verify.error.message)
    process.exit(7)
  }
  console.log('Registro verificado:', verify.data)
  process.exit(0)
}

main()

