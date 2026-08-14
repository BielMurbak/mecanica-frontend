import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import { LoginPage } from '../../pages/LoginPage'

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mecanicos" element={<div>pagina de mecanicos</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage (integração: form + AuthContext + api)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('login com sucesso navega para /mecanicos e persiste sessao', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ username: 'admin', role: 'ADMIN' }),
    })
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('Usuário'), 'admin')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('pagina de mecanicos')).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/auth/login',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(JSON.parse(localStorage.getItem('mecanica.auth'))).toMatchObject({ username: 'admin', role: 'ADMIN' })
  })

  it('credenciais invalidas (401) mostram mensagem de erro e permanecem na tela de login', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    })
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('Usuário'), 'admin')
    await user.type(screen.getByLabelText('Senha'), 'errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Usuário ou senha inválidos.')
    expect(screen.queryByText('pagina de mecanicos')).not.toBeInTheDocument()
    expect(localStorage.getItem('mecanica.auth')).toBeNull()
  })

  it('falha de rede mostra mensagem de conexao', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('Usuário'), 'admin')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível conectar à API.')
  })

  it('desabilita o botao de submit enquanto a requisicao esta em andamento', async () => {
    let resolveFetch
    global.fetch = vi.fn().mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve
      }),
    )
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('Usuário'), 'admin')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled()

    resolveFetch({ ok: true, status: 200, json: async () => ({ username: 'admin', role: 'ADMIN' }) })
    await waitFor(() => expect(screen.getByText('pagina de mecanicos')).toBeInTheDocument())
  })
})
