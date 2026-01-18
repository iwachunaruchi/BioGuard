import fs from 'node:fs'
import path from 'node:path'
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

async function main() {
  const envPath1 = path.resolve(process.cwd(), 'bioguard', '.env')
  const envPath2 = path.resolve(process.cwd(), '..', '.env')
  loadEnv(envPath1)
  loadEnv(envPath2)
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    console.error('Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }
  const supabase = createClient(url, anon, {
    auth: { autoRefreshToken: true, persistSession: false, detectSessionInUrl: false },
  })
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error consultando users:', error.message)
    process.exit(2)
  }
  console.log('users total=', data.length)
  console.log('sample=', data.slice(0, 5))
  const missing = data.filter(u => !u.email)
  console.log('usuarios sin email=', missing.length, 'ids=', missing.map(u => u.id).slice(0, 10))
  console.log(JSON.stringify({ users: data }, null, 2))
}

main().catch(e => {
  console.error('Excepción test-users:', e?.message || e)
  process.exit(9)
})
