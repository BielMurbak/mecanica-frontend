import { useEffect, useState } from 'react'
import { Plus, PencilSimple, Trash, Wrench } from '@phosphor-icons/react'
import { api } from '../api/client'
import { Drawer } from '../components/Drawer'
import { ConfirmDialog } from '../components/ConfirmDialog'

const EMPTY_FORM = { nome: '', especialidade: '', telefone: '', email: '', ativo: true }

export function MecanicosPage() {
  const [mecanicos, setMecanicos] = useState([])
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
      const data = await api.get('/api/mecanicos')
      setMecanicos(data)
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

  function openEdit(mecanico) {
    setEditingId(mecanico.id)
    setForm({
      nome: mecanico.nome,
      especialidade: mecanico.especialidade || '',
      telefone: mecanico.telefone || '',
      email: mecanico.email || '',
      ativo: mecanico.ativo,
    })
    setFieldErrors({})
    setDrawerOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFieldErrors({})
    try {
      if (editingId) {
        await api.put(`/api/mecanicos/${editingId}`, form)
      } else {
        await api.post('/api/mecanicos', form)
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
      await api.delete(`/api/mecanicos/${toDelete.id}`)
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
          <h1>Mecânicos</h1>
          <p className="page__subtitle">Equipe da oficina</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          <Plus size={18} weight="bold" />
          Novo mecânico
        </button>
      </header>

      {loading && <p className="page__status">Carregando...</p>}
      {loadError && <p className="page__status page__status--error">{loadError}</p>}

      {!loading && !loadError && mecanicos.length === 0 && (
        <div className="empty-state">
          <Wrench size={32} />
          <p>Nenhum mecânico cadastrado ainda.</p>
        </div>
      )}

      {!loading && mecanicos.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Especialidade</th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>Status</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {mecanicos.map((m) => (
                <tr key={m.id}>
                  <td>{m.nome}</td>
                  <td>{m.especialidade || '—'}</td>
                  <td className="mono">{m.telefone || '—'}</td>
                  <td>{m.email || '—'}</td>
                  <td>
                    <span className={`status-chip ${m.ativo ? 'status-chip--concluido' : 'status-chip--pendente'}`}>
                      {m.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="data-table__actions">
                    <button type="button" className="icon-button" onClick={() => openEdit(m)} aria-label={`Editar ${m.nome}`}>
                      <PencilSimple size={18} />
                    </button>
                    <button type="button" className="icon-button icon-button--danger" onClick={() => setToDelete(m)} aria-label={`Excluir ${m.nome}`}>
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer open={drawerOpen} title={editingId ? 'Editar mecânico' : 'Novo mecânico'} onClose={() => setDrawerOpen(false)}>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Nome</span>
            <input
              className="field__input"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
            {fieldErrors.nome && <span className="field__error">{fieldErrors.nome}</span>}
          </label>

          <label className="field">
            <span className="field__label">Especialidade</span>
            <input
              className="field__input"
              value={form.especialidade}
              onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
            />
          </label>

          <label className="field">
            <span className="field__label">Telefone</span>
            <input
              className="field__input"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
          </label>

          <label className="field">
            <span className="field__label">E-mail</span>
            <input
              className="field__input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {fieldErrors.email && <span className="field__error">{fieldErrors.email}</span>}
          </label>

          <label className="field field--checkbox">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
            />
            <span>Ativo</span>
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
        title="Excluir mecânico"
        message={toDelete ? `Tem certeza que deseja excluir "${toDelete.nome}"?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
        busy={deleting}
      />
    </div>
  )
}
