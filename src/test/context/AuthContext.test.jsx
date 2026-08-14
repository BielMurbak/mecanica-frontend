import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../../context/AuthContext'

vi.mock('../../api/client', () => ({
  api: { post: vi.fn() },
  setCredentials: vi.fn(),
  clearCredentials: vi.fn(),
}))

import { api } from '../../api/client'

function Probe() {
  const { user, loading, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? `${user.username}:${user.role}` : 'none'}</span>
      <button type="button" onClick={() => login('admin', '123').catch(() => {})}>
        login
      </button>
      <button type="button" onClick={logout}>
        logout
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('inicia sem usuario e loading false quando nao ha nada no localStorage', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    expect(await screen.findByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('restaura o usuario a partir do localStorage', async () => {
    localStorage.setItem('mecanica.auth', JSON.stringify({ username: 'admin', password: '123', role: 'ADMIN' }))
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    expect(await screen.findByTestId('user')).toHaveTextContent('admin:ADMIN')
  })

  it('login com sucesso guarda no localStorage e atualiza o usuario', async () => {
    api.post.mockResolvedValue({ username: 'admin', role: 'ADMIN' })
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await user.click(screen.getByText('login'))

    expect(await screen.findByTestId('user')).toHaveTextContent('admin:ADMIN')
    expect(JSON.parse(localStorage.getItem('mecanica.auth'))).toMatchObject({ username: 'admin', role: 'ADMIN' })
  })

  it('login com falha limpa as credenciais e nao seta usuario', async () => {
    const error = new Error('Usuário ou senha inválidos.')
    error.status = 401
    api.post.mockRejectedValue(error)
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await user.click(screen.getByText('login'))

    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(localStorage.getItem('mecanica.auth')).toBeNull()
  })

  it('logout remove o usuario e o localStorage', async () => {
    localStorage.setItem('mecanica.auth', JSON.stringify({ username: 'admin', password: '123', role: 'ADMIN' }))
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    expect(await screen.findByTestId('user')).toHaveTextContent('admin:ADMIN')

    await user.click(screen.getByText('logout'))

    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(localStorage.getItem('mecanica.auth')).toBeNull()
  })

  it('useAuth fora do AuthProvider lanca erro', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow('useAuth deve ser usado dentro de AuthProvider')
    consoleError.mockRestore()
  })
})
