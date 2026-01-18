const BASE_URL = 'http://localhost:3000'

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Request failed')
  }
  return res.json()
}

export const ApiService = {
  async login(email: string, password: string): Promise<{ token: string }> {
    return request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  },

  async me(token: string) {
    return request('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  async getPeople(token: string, search?: string, listType?: 'whitelist' | 'blacklist') {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (listType) params.append('listType', listType)
    return request(`/people?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  },

  async deletePerson(token: string, id: string) {
    const res = await fetch(`${BASE_URL}/people/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Delete failed')
    }
  },

  async addPerson(token: string, payload: { name: string; listType: 'whitelist' | 'blacklist'; photoBase64: string }) {
    return request('/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
  },

  async addAccessLog(token: string, payload: { personId: string; action: 'access_granted' | 'access_denied' }) {
    return request('/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
  },
}
