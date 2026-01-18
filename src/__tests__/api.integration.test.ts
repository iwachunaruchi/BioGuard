import { ApiService } from '../services/api'

describe('ApiService integration', () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@bioguard.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  let token: string
  let createdPersonId: string | null = null
  let createdUserId: string | null = null

  it('login devuelve token', async () => {
    const res = await ApiService.login(adminEmail, adminPassword)
    expect(typeof res.token).toBe('string')
    token = res.token
  })

  it('me devuelve perfil', async () => {
    const me = await ApiService.me(token)
    expect(me.email).toBe(adminEmail)
    expect(['admin', 'user']).toContain(me.role)
  })

  it('crear persona y listar', async () => {
    const photoBase64 = 'data:image/jpeg;base64,' + Buffer.from('fake').toString('base64')
    const create = await ApiService.addPerson(token, { name: 'Persona Test', listType: 'whitelist', photoBase64 })
    expect(typeof create.id).toBe('string')
    createdPersonId = create.id
    const people = await ApiService.getPeople(token)
    const ids = people.map((p: any) => p.id)
    expect(ids).toContain(createdPersonId)
  })

  it('registrar log', async () => {
    if (!createdPersonId) return
    const res = await ApiService.addAccessLog(token, { personId: createdPersonId, action: 'access_granted' })
    expect(typeof res.id).toBe('string')
  })

  it('eliminar persona', async () => {
    if (!createdPersonId) return
    await ApiService.deletePerson(token, createdPersonId)
    const people = await ApiService.getPeople(token)
    const ids = people.map((p: any) => p.id)
    expect(ids).not.toContain(createdPersonId)
  })
})
