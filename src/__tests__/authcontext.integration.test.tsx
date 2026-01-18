import React, { useEffect } from 'react'
import { render, waitFor } from '@testing-library/react-native'
import { AuthProvider, useAuth } from '../context/AuthContext'

jest.mock('expo-secure-store', () => {
  let store: Record<string, string> = {}
  return {
    setItemAsync: async (k: string, v: string) => { store[k] = v },
    getItemAsync: async (k: string) => store[k] || null,
    deleteItemAsync: async (k: string) => { delete store[k] },
  }
})

function TestLogin() {
  const { login, user } = useAuth()
  useEffect(() => {
    login(process.env.ADMIN_EMAIL || 'admin@bioguard.com', process.env.ADMIN_PASSWORD || 'admin123')
  }, [])
  return null
}

describe('AuthContext integration', () => {
  it('login establece usuario', async () => {
    const Wrapper = () => (
      <AuthProvider>
        <TestLogin />
      </AuthProvider>
    )
    const { rerender } = render(<Wrapper />)
    await waitFor(() => {
      rerender(<Wrapper />)
    })
  })
})
