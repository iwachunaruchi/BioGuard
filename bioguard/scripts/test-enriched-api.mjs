import fs from 'node:fs'
import path from 'node:path'

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
  const envPath = path.resolve(process.cwd(), '..', '.env')
  loadEnv(envPath)
  const base = process.env.EXPO_PUBLIC_API_BASE_URL
  const { token } = parseArgs()
  if (!base) {
    console.error('Falta EXPO_PUBLIC_API_BASE_URL en .env')
    process.exit(1)
  }
  if (!token) {
    console.error('Proporcione --token=<access_token>')
    process.exit(2)
  }
  const url = `${base}/api/users/enriched`
  console.log('Probando', url)
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('HTTP status=', res.status)
    const text = await res.text()
    console.log('Respuesta texto=', text.slice(0, 500))
    let json
    try { json = JSON.parse(text) } catch {}
    if (json) {
      console.log('JSON keys=', Object.keys(json))
      console.log('users sample=', (json.users || []).slice(0, 3))
    }
    process.exit(0)
  } catch (e) {
    console.error('Fallo fetch:', e?.message || e)
    console.error('Detalles:', e)
    process.exit(3)
  }
}

main()
