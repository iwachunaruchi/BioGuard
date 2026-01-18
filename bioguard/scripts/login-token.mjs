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

function parseArgs() {
  const args = {}
  for (let i = 2; i < process.argv.length; i++) {
    const [k, v] = process.argv[i].split('=')
    if (k && v) args[k.replace(/^--/, '')] = v
  }
  return args
}

async function main() {
  // Load .env from project root (bioguard/.env)
  const envPath = path.resolve(process.cwd(), '..', '.env')
  loadEnv(envPath)

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

  const args = parseArgs()
  const email = args.email || process.env.ADMIN_EMAIL
  const password = args.password || process.env.ADMIN_PASSWORD

  if (!url || !anon) {
    console.error('Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY en .env')
    process.exit(1)
  }
  if (!email || !password) {
    console.error('Proporcione credenciales: --email=... --password=... o variables ADMIN_EMAIL/ADMIN_PASSWORD')
    process.exit(2)
  }

  const supabase = createClient(url, anon, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Login falló:', error.message)
      process.exit(3)
    }
    const session = data.session
    if (!session) {
      console.error('No se recibió session tras login')
      process.exit(4)
    }
    const out = {
      access_token: session.access_token,
      token_type: session.token_type,
      expires_in: session.expires_in,
      expires_at: session.expires_at || null,
      refresh_token: session.refresh_token,
      user: {
        id: session.user?.id,
        email: session.user?.email,
        role: session.user?.role,
      },
    }
    console.log(JSON.stringify(out, null, 2))
    process.exit(0)
  } catch (e) {
    console.error('Excepción login:', e?.message || e)
    process.exit(5)
  }
}

main()
