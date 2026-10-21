import { createContext, useContext, useEffect, useState } from 'react'
import { api, setCredentials, clearCredentials } from '../api/client'

const AuthContext = createContext(null)
const STORAGE_KEY = 'mecanica.auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const { username, password, role } = JSON.parse(stored)
      setCredentials(username, password)
      setUser({ username, role })
    }
    setLoading(false)
  }, [])

  async function login(username, password) {
    // O login vai sem o header Authorization: com credenciais erradas o Spring responderia
    // 401 + WWW-Authenticate e o navegador abriria o popup nativo de Basic Auth.
    clearCredentials()
    const data = await api.post('/api/auth/login', { username, password })
    setCredentials(username, password)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username, password, role: data.role }))
    setUser({ username: data.username, role: data.role })
    return data
  }

  function logout() {
    clearCredentials()
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
