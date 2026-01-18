/* eslint-disable */
const BASE_URL = process.env.API_URL || 'http://localhost:3000'

async function req(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options)
  const text = await res.text()
  const ct = res.headers.get('content-type') || ''
  const body = ct.includes('application/json') ? JSON.parse(text || '{}') : text
  return { ok: res.ok, status: res.status, body, headers: Object.fromEntries(res.headers.entries()) }
}

function log(step, ok, extra = '') {
  console.log(`${ok ? '✅' : '❌'} ${step}${extra ? ' - ' + extra : ''}`)
}

async function run() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@bioguard.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    const login = await req('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    })
    log('Login admin', login.ok, `status=${login.status}`)
    if (!login.ok) throw new Error('Login failed')
    const token = login.body.token
    const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

    const me = await req('/auth/me', { headers: auth })
    log('/auth/me', me.ok)

    const createUser = await req('/users', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ email: `user${Date.now()}@bioguard.com`, password: 'user123', name: 'Usuario Prueba', role: 'user' }),
    })
    log('POST /users', createUser.ok)
    const userId = createUser.ok ? createUser.body.id : null

    const users = await req('/users', { headers: auth })
    log('GET /users', users.ok, `count=${Array.isArray(users.body) ? users.body.length : 'n/a'}`)

    const photoBase64 = 'data:image/jpeg;base64,' + Buffer.from('fake').toString('base64')
    const personCreate = await req('/people', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ name: 'Persona Prueba', listType: 'whitelist', photoBase64 }),
    })
    log('POST /people', personCreate.ok)
    const personId = personCreate.ok ? personCreate.body.id : null

    const peopleList = await req('/people', { headers: auth })
    log('GET /people', peopleList.ok, `count=${Array.isArray(peopleList.body) ? peopleList.body.length : 'n/a'}`)

    if (personId) {
      const photo = await req(`/people/${personId}/photo`, { headers: { Authorization: auth.Authorization } })
      const isJpeg = (photo.headers['content-type'] || '').includes('image/jpeg')
      log('GET /people/:id/photo', photo.ok && isJpeg, `ct=${photo.headers['content-type']}`)
    }

    if (personId) {
      const logCreate = await req('/logs', {
        method: 'POST',
        headers: auth,
        body: JSON.stringify({ personId, action: 'access_granted' }),
      })
      log('POST /logs', logCreate.ok)
    }

    const logs = await req('/logs', { headers: auth })
    log('GET /logs', logs.ok)

    if (personId) {
      const delPerson = await req(`/people/${personId}`, { method: 'DELETE', headers: { Authorization: auth.Authorization } })
      log('DELETE /people/:id', delPerson.status === 204)
    }

    if (userId) {
      const delUser = await req(`/users/${userId}`, { method: 'DELETE', headers: { Authorization: auth.Authorization } })
      log('DELETE /users/:id', delUser.status === 204)
    }
  } catch (e) {
    console.error('Validación fallida:', e.message || e)
    process.exitCode = 1
  }
}

run()
