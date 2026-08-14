import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MecanicosPage } from '../../pages/MecanicosPage'

function jsonResponse(status, body) {
  return { ok: true, status, json: async () => body }
}

function createFetchMock(initialData) {
  let data = [...initialData]
  let nextId = data.length + 1
  return vi.fn(async (url, options = {}) => {
    const method = options.method || 'GET'

    if (method === 'GET' && url.endsWith('/api/mecanicos')) {
      return jsonResponse(200, data)
    }
    if (method === 'POST' && url.endsWith('/api/mecanicos')) {
      const body = JSON.parse(options.body)
      const created = { id: nextId++, ...body }
      data.push(created)
      return jsonResponse(201, created)
    }
    if (method === 'PUT' && /\/api\/mecanicos\/\d+$/.test(url)) {
      const id = Number(url.split('/').pop())
      const body = JSON.parse(options.body)
      data = data.map((m) => (m.id === id ? { ...m, ...body, id } : m))
      return jsonResponse(200, { ...body, id })
    }
    if (method === 'DELETE' && /\/api\/mecanicos\/\d+$/.test(url)) {
      const id = Number(url.split('/').pop())
      data = data.filter((m) => m.id !== id)
      return { ok: true, status: 204, json: async () => { throw new Error('sem corpo') } }
    }
    throw new Error(`requisicao nao tratada no mock: ${method} ${url}`)
  })
}

describe('MecanicosPage (integração: listagem + CRUD via api mockada)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('carrega e exibe a lista de mecanicos', async () => {
    global.fetch = createFetchMock([
      { id: 1, nome: 'João Silva', especialidade: 'Motor', telefone: '', email: '', ativo: true },
    ])
    render(<MecanicosPage />)

    expect(await screen.findByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Motor')).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('mostra estado vazio quando nao ha mecanicos', async () => {
    global.fetch = createFetchMock([])
    render(<MecanicosPage />)

    expect(await screen.findByText('Nenhum mecânico cadastrado ainda.')).toBeInTheDocument()
  })

  it('mostra mensagem de erro quando o carregamento falha', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('x') } })
    render(<MecanicosPage />)

    expect(await screen.findByText('Erro 500')).toBeInTheDocument()
  })

  it('cria um novo mecanico pelo drawer e atualiza a lista', async () => {
    global.fetch = createFetchMock([])
    const user = userEvent.setup()
    render(<MecanicosPage />)

    await screen.findByText('Nenhum mecânico cadastrado ainda.')

    await user.click(screen.getByRole('button', { name: /Novo mecânico/i }))
    expect(screen.getByRole('dialog', { name: 'Novo mecânico' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nome'), 'Maria Souza')
    await user.type(screen.getByLabelText('Especialidade'), 'Suspensão')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByText('Maria Souza')).toBeInTheDocument()
    expect(screen.getByText('Suspensão')).toBeInTheDocument()
  })

  it('edita um mecanico existente pelo drawer', async () => {
    global.fetch = createFetchMock([
      { id: 1, nome: 'João Silva', especialidade: 'Motor', telefone: '', email: '', ativo: true },
    ])
    const user = userEvent.setup()
    render(<MecanicosPage />)

    await screen.findByText('João Silva')
    await user.click(screen.getByRole('button', { name: 'Editar João Silva' }))

    const nomeInput = screen.getByLabelText('Nome')
    expect(nomeInput).toHaveValue('João Silva')

    await user.clear(nomeInput)
    await user.type(nomeInput, 'João Pereira')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByText('João Pereira')).toBeInTheDocument()
    expect(screen.queryByText('João Silva')).not.toBeInTheDocument()
  })

  it('exclui um mecanico apos confirmar no dialog', async () => {
    global.fetch = createFetchMock([
      { id: 1, nome: 'João Silva', especialidade: 'Motor', telefone: '', email: '', ativo: true },
    ])
    const user = userEvent.setup()
    render(<MecanicosPage />)

    await screen.findByText('João Silva')
    await user.click(screen.getByRole('button', { name: 'Excluir João Silva' }))

    const dialog = screen.getByRole('alertdialog', { name: 'Excluir mecânico' })
    expect(within(dialog).getByText('Tem certeza que deseja excluir "João Silva"?')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(screen.queryByText('João Silva')).not.toBeInTheDocument())
    expect(await screen.findByText('Nenhum mecânico cadastrado ainda.')).toBeInTheDocument()
  })

  it('cancelar a exclusao mantem o mecanico na lista', async () => {
    global.fetch = createFetchMock([
      { id: 1, nome: 'João Silva', especialidade: 'Motor', telefone: '', email: '', ativo: true },
    ])
    const user = userEvent.setup()
    render(<MecanicosPage />)

    await screen.findByText('João Silva')
    await user.click(screen.getByRole('button', { name: 'Excluir João Silva' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })
})
