const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

let authHeader = null

export function setCredentials(username, password) {
  authHeader = username && password ? 'Basic ' + btoa(`${username}:${password}`) : null
}

export function clearCredentials() {
  authHeader = null
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (authHeader) headers.Authorization = authHeader

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = `Erro ${res.status}`
    let fieldErrors
    try {
      const body = await res.json()
      message = body.message || message
      fieldErrors = body.fieldErrors
    } catch {
      // resposta sem corpo JSON
    }
    const err = new Error(message)
    err.status = res.status
    err.fieldErrors = fieldErrors
    throw err
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
