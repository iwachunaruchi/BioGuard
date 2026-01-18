import fs from 'node:fs'
import path from 'node:path'

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const raw = fs.readFileSync(filePath, 'utf-8')
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
  loadEnvFile(envPath)
  const base = process.env.EXPO_PUBLIC_API_BASE_URL
  if (!base) {
    console.error('No EXPO_PUBLIC_API_BASE_URL en', envPath)
    process.exit(1)
  }
  const url = `${base}/api/users/enriched`
  console.log('Probar GET', url)
  try {
    const res = await fetch(url)
    console.log('status=', res.status)
    const txt = await res.text()
    console.log('body=', txt.slice(0, 300))
    process.exit(0)
  } catch (e) {
    console.error('Error fetch:', e?.message || e)
    console.error('Detalles:', e)
    process.exit(2)
  }
}

main()
