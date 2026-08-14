import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusChip, STATUS_OPTIONS } from '../../components/StatusChip'

describe('StatusChip', () => {
  it('renderiza o rotulo e a classe para PENDENTE', () => {
    render(<StatusChip status="PENDENTE" />)
    const chip = screen.getByText('Pendente')
    expect(chip).toHaveClass('status-chip', 'status-chip--pendente')
  })

  it('renderiza o rotulo e a classe para EM_ANDAMENTO', () => {
    render(<StatusChip status="EM_ANDAMENTO" />)
    const chip = screen.getByText('Em andamento')
    expect(chip).toHaveClass('status-chip', 'status-chip--andamento')
  })

  it('renderiza o rotulo e a classe para CONCLUIDO', () => {
    render(<StatusChip status="CONCLUIDO" />)
    const chip = screen.getByText('Concluído')
    expect(chip).toHaveClass('status-chip', 'status-chip--concluido')
  })

  it('usa o proprio valor como rotulo quando o status e desconhecido', () => {
    render(<StatusChip status="INEXISTENTE" />)
    const chip = screen.getByText('INEXISTENTE')
    expect(chip).toHaveClass('status-chip')
    expect(chip).not.toHaveClass('status-chip--pendente')
  })

  it('expoe STATUS_OPTIONS com os tres status na ordem correta', () => {
    expect(STATUS_OPTIONS).toEqual([
      { value: 'PENDENTE', label: 'Pendente' },
      { value: 'EM_ANDAMENTO', label: 'Em andamento' },
      { value: 'CONCLUIDO', label: 'Concluído' },
    ])
  })
})
