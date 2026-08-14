import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, clearCredentials, setCredentials } from '../../api/client'

function mockFetchOnce(response) {
  global.fetch = vi.fn().mockResolvedValue(response)
}

describe('api client', () => {
  beforeEach(() => {
    clearCredentials()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('nao envia Authorization quando nenhuma credencial foi definida', async () => {
    mockFetchOnce({ ok: true, status: 200, json: async () => ({ ok: true }) })
    await api.get('/api/mecanicos')

    const [, options] = global.fetch.mock.calls[0]
    expect(options.headers.Authorization).toBeUndefined()
  })

  it('envia Authorization Basic apos setCredentials', async () => {
    setCredentials('admin', '123')
    mockFetchOnce({ ok: true, status: 200, json: async () => ({}) })
    await api.get('/api/mecanicos')

    const [, options] = global.fetch.mock.calls[0]
    expect(options.headers.Authorization).toBe('Basic ' + btoa('admin:123'))
  })

  it('para de enviar Authorization apos clearCredentials', async () => {
    setCredentials('admin', '123')
    clearCredentials()
    mockFetchOnce({ ok: true, status: 200, json: async () => ({}) })
    await api.get('/api/mecanicos')

    const [, options] = global.fetch.mock.calls[0]
    expect(options.headers.Authorization).toBeUndefined()
  })

  it('get monta a URL correta e retorna o JSON', async () => {
    mockFetchOnce({ ok: true, status: 200, json: async () => ([{ id: 1 }]) })
    const data = await api.get('/api/mecanicos')

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/mecanicos',
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
    )
    expect(data).toEqual([{ id: 1 }])
  })

  it('post envia method e body serializados', async () => {
    mockFetchOnce({ ok: true, status: 201, json: async () => ({ id: 1 }) })
    await api.post('/api/mecanicos', { nome: 'João' })

    const [, options] = global.fetch.mock.calls[0]
    expect(options.method).toBe('POST')
    expect(options.body).toBe(JSON.stringify({ nome: 'João' }))
  })

  it('put envia method PUT', async () => {
    mockFetchOnce({ ok: true, status: 200, json: async () => ({}) })
    await api.put('/api/mecanicos/1', { nome: 'João' })
    expect(global.fetch.mock.calls[0][1].method).toBe('PUT')
  })

  it('delete envia method DELETE e retorna null em 204', async () => {
    mockFetchOnce({ ok: true, status: 204, json: async () => { throw new Error('sem corpo') } })
    const result = await api.delete('/api/mecanicos/1')

    expect(global.fetch.mock.calls[0][1].method).toBe('DELETE')
    expect(result).toBeNull()
  })

  it('lanca erro com mensagem e fieldErrors do corpo JSON em resposta de erro', async () => {
    mockFetchOnce({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Dados inválidos', fieldErrors: { nome: 'obrigatório' } }),
    })

    await expect(api.post('/api/mecanicos', {})).rejects.toMatchObject({
      message: 'Dados inválidos',
      status: 400,
      fieldErrors: { nome: 'obrigatório' },
    })
  })

  it('lanca erro com mensagem generica quando a resposta de erro nao tem corpo JSON', async () => {
    mockFetchOnce({
      ok: false,
      status: 500,
      json: async () => { throw new Error('sem corpo') },
    })

    await expect(api.get('/api/mecanicos')).rejects.toMatchObject({
      message: 'Erro 500',
      status: 500,
    })
  })
})
