export function ConfirmDialog({ open, title, message, onConfirm, onCancel, busy }) {
  if (!open) return null

  return (
    <div className="drawer-overlay" onClick={onCancel}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirm-dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className="btn btn--destructive" onClick={onConfirm} disabled={busy}>
            {busy ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}
