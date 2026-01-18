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
  const envPath = path.resolve(process.cwd(), 'bioguard', '.env')
  if (fs.existsSync(envPath)) {
    loadEnv(envPath)
  } else {
    console.log('No se encontró .env en', envPath)
  }

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  console.log('Validando variables de entorno...')
  if (!url || !anon) {
    console.error('Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }
  if (anon.startsWith('sb_publishable_')) {
    console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY parece una publishable key, no un anon key de Supabase')
    process.exit(2)
  }
  if (!adminEmail || !adminPassword) {
    console.error('Faltan ADMIN_EMAIL o ADMIN_PASSWORD para probar login')
    process.exit(3)
  }

  const supabase = createClient(url, anon, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })

  console.log('Probando conexión con getSession...')
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error getSession:', error.message)
    } else {
      console.log('getSession OK. session=', !!data.session)
    }
  } catch (e) {
    console.error('Excepción getSession:', e?.message || e)
  }

  console.log('Intentando signInWithPassword con ADMIN_EMAIL...')
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    })
    if (error) {
      console.error('Login falló:', error.message)
      process.exit(4)
    }
    console.log('Login OK. user id=', data.user?.id)
    process.exit(0)
  } catch (e) {
    console.error('Excepción login:', e?.message || e)
    process.exit(5)
  }
}

main()

