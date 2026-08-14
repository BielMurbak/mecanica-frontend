import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServicosPage } from '../../pages/ServicosPage'

function jsonResponse(status, body) {
  return { ok: true, status, json: async () => body }
}

const MECANICOS = [
  { id: 1, nome: 'João Silva', ativo: true },
  { id: 2, nome: 'Carlos Souza', ativo: false },
]

function createFetchMock(initialServicos, mecanicos = MECANICOS) {
  let data = [...initialServicos]
  let nextId = data.length + 1
  return vi.fn(async (url, options = {}) => {
    const method = options.method || 'GET'

    if (method === 'GET' && url.endsWith('/api/mecanicos')) {
      return jsonResponse(200, mecanicos)
    }
    if (method === 'GET' && url.endsWith('/api/servicos')) {
      return jsonResponse(200, data)
    }
    if (method === 'POST' && url.endsWith('/api/servicos')) {
      const body = JSON.parse(options.body)
      const created = { id: nextId++, ...body }
      data.push(created)
      return jsonResponse(201, created)
    }
    if (method === 'PUT' && /\/api\/servicos\/\d+$/.test(url)) {
      const id = Number(url.split('/').pop())
      const body = JSON.parse(options.body)
      data = data.map((s) => (s.id === id ? { ...s, ...body, id } : s))
      return jsonResponse(200, { ...body, id })
    }
    if (method === 'DELETE' && /\/api\/servicos\/\d+$/.test(url)) {
      const id = Number(url.split('/').pop())
      data = data.filter((s) => s.id !== id)
      return { ok: true, status: 204, json: async () => { throw new Error('sem corpo') } }
    }
    throw new Error(`requisicao nao tratada no mock: ${method} ${url}`)
  })
}

describe('ServicosPage (integração: listagem + CRUD via api mockada)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('carrega e exibe a lista de servicos com status e valor formatado', async () => {
    global.fetch = createFetchMock([
      { id: 1, descricao: 'Troca de óleo', valor: 150, mecanico: 'João Silva', carro: 'Gol', duracaoEstimadaDias: 1, status: 'PENDENTE' },
    ])
    render(<ServicosPage />)

    expect(await screen.findByText('Troca de óleo')).toBeInTheDocument()
    expect(screen.getByText('Pendente')).toBeInTheDocument()
    expect(screen.getByText((text) => text.replace(/\s/g, ' ').includes('R$ 150,00'))).toBeInTheDocument()
    expect(screen.getByText('Gol')).toBeInTheDocument()
  })

  it('mostra estado vazio quando nao ha servicos', async () => {
    global.fetch = createFetchMock([])
    render(<ServicosPage />)

    expect(await screen.findByText('Nenhum serviço cadastrado ainda.')).toBeInTheDocument()
  })

  it('cria um novo servico selecionando mecanico e status pelo Select customizado', async () => {
    global.fetch = createFetchMock([])
    const user = userEvent.setup()
    render(<ServicosPage />)

    await screen.findByText('Nenhum serviço cadastrado ainda.')

    await user.click(screen.getByRole('button', { name: /Novo serviço/i }))
    expect(screen.getByRole('dialog', { name: 'Novo serviço' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Descrição'), 'Alinhamento')
    await user.type(screen.getByLabelText('Valor (R$)'), '200')

    await user.click(screen.getByRole('button', { name: 'Mecânico responsável' }))
    await user.click(screen.getByRole('option', { name: 'João Silva' }))

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByText('Alinhamento')).toBeInTheDocument()
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })

  it('so lista mecanicos ativos no select de mecanico responsavel', async () => {
    global.fetch = createFetchMock([])
    const user = userEvent.setup()
    render(<ServicosPage />)

    await screen.findByText('Nenhum serviço cadastrado ainda.')
    await user.click(screen.getByRole('button', { name: /Novo serviço/i }))
    await user.click(screen.getByRole('button', { name: 'Mecânico responsável' }))

    expect(screen.getByRole('option', { name: 'João Silva' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Carlos Souza' })).not.toBeInTheDocument()
  })

  it('edita um servico existente pelo drawer', async () => {
    global.fetch = createFetchMock([
      { id: 1, descricao: 'Troca de óleo', valor: 150, mecanico: 'João Silva', carro: 'Gol', duracaoEstimadaDias: 1, status: 'PENDENTE' },
    ])
    const user = userEvent.setup()
    render(<ServicosPage />)

    await screen.findByText('Troca de óleo')
    await user.click(screen.getByRole('button', { name: 'Editar serviço' }))

    const descricaoInput = screen.getByLabelText('Descrição')
    expect(descricaoInput).toHaveValue('Troca de óleo')

    await user.clear(descricaoInput)
    await user.type(descricaoInput, 'Troca de óleo e filtro')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await screen.findByText('Troca de óleo e filtro')).toBeInTheDocument()
  })

  it('exclui um servico apos confirmar no dialog', async () => {
    global.fetch = createFetchMock([
      { id: 1, descricao: 'Troca de óleo', valor: 150, mecanico: 'João Silva', carro: 'Gol', duracaoEstimadaDias: 1, status: 'PENDENTE' },
    ])
    const user = userEvent.setup()
    render(<ServicosPage />)

    await screen.findByText('Troca de óleo')
    await user.click(screen.getByRole('button', { name: 'Excluir serviço' }))

    const dialog = screen.getByRole('alertdialog', { name: 'Excluir serviço' })
    expect(within(dialog).getByText('Tem certeza que deseja excluir "Troca de óleo"?')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }))

    await waitFor(() => expect(screen.queryByText('Troca de óleo')).not.toBeInTheDocument())
    expect(await screen.findByText('Nenhum serviço cadastrado ainda.')).toBeInTheDocument()
  })
})
