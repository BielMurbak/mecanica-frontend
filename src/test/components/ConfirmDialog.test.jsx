import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '../../components/ConfirmDialog'

describe('ConfirmDialog', () => {
  it('nao renderiza nada quando open e false', () => {
    const { container } = render(
      <ConfirmDialog open={false} title="Excluir" message="msg" onConfirm={vi.fn()} onCancel={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza titulo e mensagem quando open e true', () => {
    render(<ConfirmDialog open title="Excluir mecânico" message="Tem certeza?" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('alertdialog', { name: 'Excluir mecânico' })).toBeInTheDocument()
    expect(screen.getByText('Tem certeza?')).toBeInTheDocument()
  })

  it('chama onConfirm ao clicar em Excluir', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmDialog open title="t" message="m" onConfirm={onConfirm} onCancel={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('chama onCancel ao clicar em Cancelar', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmDialog open title="t" message="m" onConfirm={vi.fn()} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('chama onCancel ao clicar no overlay, mas nao ao clicar dentro do dialog', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ConfirmDialog open title="Titulo" message="m" onConfirm={vi.fn()} onCancel={onCancel} />)

    await user.click(screen.getByText('Titulo'))
    expect(onCancel).not.toHaveBeenCalled()

    await user.click(screen.getByRole('alertdialog').parentElement)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('desabilita os botoes e mostra "Excluindo..." quando busy', () => {
    render(<ConfirmDialog open title="t" message="m" onConfirm={vi.fn()} onCancel={vi.fn()} busy />)
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Excluindo...' })).toBeDisabled()
  })
})
