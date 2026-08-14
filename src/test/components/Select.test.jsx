import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Select } from '../../components/Select'

const OPTIONS = [
  { value: 'a', label: 'Opção A' },
  { value: 'b', label: 'Opção B' },
]

describe('Select', () => {
  it('mostra o placeholder quando nenhum valor esta selecionado', () => {
    render(<Select value="" onChange={vi.fn()} options={OPTIONS} placeholder="Escolha" />)
    expect(screen.getByText('Escolha')).toBeInTheDocument()
  })

  it('mostra o rotulo da opcao selecionada', () => {
    render(<Select value="b" onChange={vi.fn()} options={OPTIONS} />)
    expect(screen.getByRole('button')).toHaveTextContent('Opção B')
  })

  it('abre o painel de opcoes ao clicar no trigger', async () => {
    const user = userEvent.setup()
    render(<Select value="" onChange={vi.fn()} options={OPTIONS} />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(2)
  })

  it('chama onChange e fecha o painel ao selecionar uma opcao', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<Select value="" onChange={onChange} options={OPTIONS} />)

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('Opção A'))

    expect(onChange).toHaveBeenCalledWith('a')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('fecha o painel ao pressionar Escape', async () => {
    const user = userEvent.setup()
    render(<Select value="" onChange={vi.fn()} options={OPTIONS} />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('fecha o painel ao clicar fora do componente', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <Select value="" onChange={vi.fn()} options={OPTIONS} />
        <button type="button">fora</button>
      </div>,
    )
    await user.click(screen.getByRole('button', { name: /selecione/i }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await user.click(screen.getByText('fora'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
