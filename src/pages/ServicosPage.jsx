import { useEffect, useState } from 'react'
import { Plus, PencilSimple, Trash, ClipboardText } from '@phosphor-icons/react'
import { api } from '../api/client'
import { Drawer } from '../components/Drawer'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { StatusChip, STATUS_OPTIONS } from '../components/StatusChip'

const EMPTY_FORM = {
  descricao: '',
  valor: '',
  mecanico: '',
  carro: '',
  duracaoEstimadaDias: '',
  status: 'PENDENTE',
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function ServicosPage() {
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await api.get('/api/servicos')
      setServicos(data)
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFieldErrors({})
    setDrawerOpen(true)
  }

  function openEdit(servico) {
    setEditingId(servico.id)
    setForm({
      descricao: servico.descricao,
      valor: String(servico.valor),
      mecanico: servico.mecanico || '',
      carro: servico.carro || '',
      duracaoEstimadaDias: servico.duracaoEstimadaDias ? String(servico.duracaoEstimadaDias) : '',
      status: servico.status,
    })
    setFieldErrors({})
    setDrawerOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFieldErrors({})
    try {
      const payload = {
        ...form,
        valor: Number(form.valor),
        duracaoEstimadaDias: form.duracaoEstimadaDias ? Number(form.duracaoEstimadaDias) : null,
      }
      if (editingId) {
        await api.put(`/api/servicos/${editingId}`, payload)
      } else {
        await api.post('/api/servicos', payload)
      }
      setDrawerOpen(false)
      await load()
    } catch (err) {
      if (err.fieldErrors) setFieldErrors(err.fieldErrors)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.delete(`/api/servicos/${toDelete.id}`)
      setToDelete(null)
      await load()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>Serviços</h1>
          <p className="page__subtitle">Ordens de serviço da oficina</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          <Plus size={18} weight="bold" />
          Novo serviço
        </button>
      </header>

      {loading && <p className="page__status">Carregando...</p>}
      {loadError && <p className="page__status page__status--error">{loadError}</p>}

      {!loading && !loadError && servicos.length === 0 && (
        <div className="empty-state">
          <ClipboardText size={32} />
          <p>Nenhum serviço cadastrado ainda.</p>
        </div>
      )}

      {!loading && servicos.length > 0 && (
        <div className="cards-grid">
          {servicos.map((s) => (
            <article key={s.id} className="service-card">
              <div className="service-card__header">
                <StatusChip status={s.status} />
                <span className="service-card__value mono">{currencyFormatter.format(s.valor)}</span>
              </div>
              <h3 className="service-card__title">{s.descricao}</h3>
              <dl className="service-card__meta">
                <div>
                  <dt>Carro</dt>
                  <dd>{s.carro || '—'}</dd>
                </div>
                <div>
                  <dt>Mecânico</dt>
                  <dd>{s.mecanico || '—'}</dd>
                </div>
                <div>
                  <dt>Duração est.</dt>
                  <dd className="mono">{s.duracaoEstimadaDias ? `${s.duracaoEstimadaDias} dia(s)` : '—'}</dd>
                </div>
              </dl>
              <div className="service-card__actions">
                <button type="button" className="icon-button" onClick={() => openEdit(s)} aria-label="Editar serviço">
                  <PencilSimple size={18} />
                </button>
                <button type="button" className="icon-button icon-button--danger" onClick={() => setToDelete(s)} aria-label="Excluir serviço">
                  <Trash size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Drawer open={drawerOpen} title={editingId ? 'Editar serviço' : 'Novo serviço'} onClose={() => setDrawerOpen(false)}>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Descrição</span>
            <input
              className="field__input"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required
            />
            {fieldErrors.descricao && <span className="field__error">{fieldErrors.descricao}</span>}
          </label>

          <label className="field">
            <span className="field__label">Valor (R$)</span>
            <input
              type="number"
              className="field__input field__input--no-spinner mono"
              min="0"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              required
            />
            {fieldErrors.valor && <span className="field__error">{fieldErrors.valor}</span>}
          </label>

          <label className="field">
            <span className="field__label">Mecânico responsável</span>
            <input
              className="field__input"
              value={form.mecanico}
              onChange={(e) => setForm({ ...form, mecanico: e.target.value })}
            />
          </label>

          <label className="field">
            <span className="field__label">Carro</span>
            <input
              className="field__input"
              value={form.carro}
              onChange={(e) => setForm({ ...form, carro: e.target.value })}
            />
          </label>

          <label className="field">
            <span className="field__label">Duração estimada (dias)</span>
            <input
              className="field__input mono"
              min="1"
              value={form.duracaoEstimadaDias}
              onChange={(e) => setForm({ ...form, duracaoEstimadaDias: e.target.value })}
            />
          </label>

          <label className="field">
            <span className="field__label">Status</span>
            <select
              className="field__input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <div className="drawer__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setDrawerOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title="Excluir serviço"
        message={toDelete ? `Tem certeza que deseja excluir "${toDelete.descricao}"?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </div>
  )
}
