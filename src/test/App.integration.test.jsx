import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

function jsonResponse(status, body) {
  return { ok: true, status, json: async () => body }
}

function mockAuthenticatedFetch() {
  global.fetch = vi.fn(async (url) => {
    if (url.endsWith('/api/mecanicos')) return jsonResponse(200, [])
    if (url.endsWith('/api/servicos')) return jsonResponse(200, [])
    throw new Error(`requisicao nao tratada no mock: ${url}`)
  })
}

describe('App (integração: roteamento + autenticação de ponta a ponta)', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/')
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('usuario nao autenticado e redirecionado para /login ao acessar a raiz', async () => {
    render(<App />)
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('usuario autenticado (sessao no localStorage) acessa /mecanicos com o layout completo', async () => {
    localStorage.setItem('mecanica.auth', JSON.stringify({ username: 'admin', password: '123', role: 'ADMIN' }))
    mockAuthenticatedFetch()
    window.history.pushState({}, '', '/mecanicos')

    render(<App />)

    expect(await screen.findByText('Gestão de Mecânica')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mecânicos' })).toBeInTheDocument()
  })

  it('login bem sucedido leva o usuario ate a pagina de mecanicos', async () => {
    global.fetch = vi.fn(async (url, options = {}) => {
      const method = options.method || 'GET'
      if (method === 'POST' && url.endsWith('/api/auth/login')) {
        return jsonResponse(200, { username: 'admin', role: 'ADMIN' })
      }
      if (url.endsWith('/api/mecanicos')) return jsonResponse(200, [])
      throw new Error(`requisicao nao tratada no mock: ${method} ${url}`)
    })
    window.history.pushState({}, '', '/login')
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Usuário'), 'admin')
    await user.type(screen.getByLabelText('Senha'), '123456')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'Mecânicos' })).toBeInTheDocument()
  })

  it('logout leva de volta para a tela de login', async () => {
    localStorage.setItem('mecanica.auth', JSON.stringify({ username: 'admin', password: '123', role: 'ADMIN' }))
    mockAuthenticatedFetch()
    window.history.pushState({}, '', '/mecanicos')
    const user = userEvent.setup()

    render(<App />)
    await screen.findByRole('heading', { name: 'Mecânicos' })

    await user.click(screen.getByRole('button', { name: /Sair/i }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument())
    expect(localStorage.getItem('mecanica.auth')).toBeNull()
  })

  it('rota desconhecida redireciona para /mecanicos (ou /login se nao autenticado)', async () => {
    window.history.pushState({}, '', '/rota-que-nao-existe')
    render(<App />)
    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })
})
