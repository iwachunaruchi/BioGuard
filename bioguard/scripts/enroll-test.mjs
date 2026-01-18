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

function readImageBase64(imagePath) {
  const buf = fs.readFileSync(imagePath)
  return buf.toString('base64')
}

const fallbackPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO0Q3KcAAAAASUVORK5CYII='

async function main() {
  const envPath = path.resolve(process.cwd(), '..', '.env')
  loadEnv(envPath)
  const args = parseArgs()

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  const api = args.api || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.72:8000'
  const apiBase = api.replace(/\/+$/, '')

  const email = args.email || process.env.ADMIN_EMAIL || 'mielesdiego03@gmail.com'
  const password = args.password || process.env.ADMIN_PASSWORD || 'dieguchi123'
  const angle = args.angle || 'front'
  const imagePath = args.image
  const useBackendLogin = args['use-backend-login'] === '1' || args['use_backend_login'] === '1'

  if (!url || !anon) {
    console.error('Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY en .env')
    process.exit(1)
  }

  let accessToken = null
  let tokenType = 'bearer'
  if (useBackendLogin) {
    console.log('Iniciando sesión vía backend /api/auth/login...', 'API_BASE=', apiBase)
    try {
      const form = new URLSearchParams()
      form.set('username', email)
      form.set('password', password)
      const loginRes = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      })
      if (!loginRes.ok) {
        const t = await loginRes.text()
        console.error('Login backend falló. Status:', loginRes.status, 'Body:', t)
        process.exit(2)
      }
      const loginJson = await loginRes.json()
      accessToken = loginJson.access_token
      tokenType = loginJson.token_type || 'bearer'
      console.log('Login backend OK. Token_type:', tokenType)
    } catch (e) {
      console.error('Excepción login backend:', e?.message || e)
      process.exit(2)
    }
  } else {
    const supabase = createClient(url, anon, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
    console.log('Iniciando sesión en Supabase...')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Login falló:', error.message)
      process.exit(2)
    }
    const session = data.session
    if (!session?.access_token) {
      console.error('No se obtuvo access_token tras login')
      process.exit(3)
    }
    accessToken = session.access_token
    tokenType = session.token_type || 'bearer'
    console.log('Login OK. Usuario:', data.user?.email, 'Token_type:', tokenType)
  }

  let imageBase64 = fallbackPngBase64
  if (imagePath) {
    try {
      imageBase64 = readImageBase64(path.resolve(imagePath))
    } catch (e) {
      console.warn('No se pudo leer la imagen, usando PNG de prueba incorporado:', e?.message || e)
    }
  }

  const payload = {
    image_base64: imageBase64,
    angle_type: angle,
  }

  const endpoint = `${apiBase}/api/enroll`
  console.log('Enviando POST a', endpoint, 'con angle', angle)
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }

  console.log('Status:', res.status)
  console.log('Respuesta:', JSON.stringify(json, null, 2))

  if (!res.ok) process.exit(4)
  process.exit(0)
}

main()
