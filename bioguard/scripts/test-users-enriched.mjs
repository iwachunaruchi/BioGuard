import fs from 'node:fs'
import path from 'node:path'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return
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

async function fetchAuthUsers(url, serviceKey) {
  if (!url || !serviceKey) return { users: [], nextPage: null }
  const out = []
  let nextUrl = `${url}/auth/v1/admin/users?per_page=200`
  while (nextUrl) {
    const r = await fetch(nextUrl, { headers: { Authorization: `Bearer ${serviceKey}` } })
    if (!r.ok) throw new Error(`Auth admin error: ${await r.text()}`)
    const json = await r.json()
    out.push(...(json.users || []))
    nextUrl = json.nextPage
  }
  return out
}

async function main() {
  const envPath1 = path.resolve(process.cwd(), 'bioguard', '.env')
  const envPath2 = path.resolve(process.cwd(), '..', '.env')
  loadEnv(envPath1)
  loadEnv(envPath2)
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anon) {
    console.error('Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, anon, {
    auth: { autoRefreshToken: true, persistSession: false, detectSessionInUrl: false },
  })

  const { data: users, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Error consultando public.users:', error.message)
    process.exit(2)
  }

  console.log('public.users total=', users.length)
  console.log('public.users sample=', users.slice(0, 5))

  let authUsers = []
  if (serviceKey) {
    authUsers = await fetchAuthUsers(url, serviceKey)
    console.log('auth.users total=', authUsers.length)
    console.log('auth.users sample=', authUsers.slice(0, 5).map(u => ({ id: u.id, email: u.email })))
  } else {
    console.log('SIN SUPABASE_SERVICE_ROLE_KEY: no se puede consultar auth admin')
  }

  const emailsMap = new Map(authUsers.map(u => [u.id, u.email]))
  const joined = users.map(u => ({
    id: u.id,
    full_name: u.full_name,
    role: u.role,
    email_table: u.email || null,
    email_auth: emailsMap.get(u.id) || null,
    email_final: u.email || emailsMap.get(u.id) || null,
  }))

  console.log('Comparación primera página:')
  console.table(joined.slice(0, 10))
  const missing = joined.filter(j => !j.email_final)
  console.log('Usuarios sin email (final)=', missing.length, 'ids=', missing.slice(0, 10).map(m => m.id))

  // Salida JSON para validación automatizada
  console.log(JSON.stringify({ users, authUsers: authUsers.map(u => ({ id: u.id, email: u.email })), joined }, null, 2))
}

main().catch(e => {
  console.error('Excepción test-users-enriched:', e?.message || e)
  process.exit(9)
})
