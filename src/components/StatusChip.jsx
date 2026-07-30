const LABELS = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
}

const CLASS = {
  PENDENTE: 'status-chip status-chip--pendente',
  EM_ANDAMENTO: 'status-chip status-chip--andamento',
  CONCLUIDO: 'status-chip status-chip--concluido',
}

export function StatusChip({ status }) {
  return <span className={CLASS[status] || 'status-chip'}>{LABELS[status] || status}</span>
}

export const STATUS_OPTIONS = Object.entries(LABELS).map(([value, label]) => ({ value, label }))
