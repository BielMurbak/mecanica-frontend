import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Drawer } from '../../components/Drawer'

describe('Drawer', () => {
  it('nao renderiza nada quando open e false', () => {
    const { container } = render(
      <Drawer open={false} title="t" onClose={vi.fn()}>
        conteudo
      </Drawer>,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renderiza titulo e children quando open e true', () => {
    render(
      <Drawer open title="Novo mecânico" onClose={vi.fn()}>
        <p>conteudo do form</p>
      </Drawer>,
    )
    expect(screen.getByRole('dialog', { name: 'Novo mecânico' })).toBeInTheDocument()
    expect(screen.getByText('conteudo do form')).toBeInTheDocument()
  })

  it('foca o botao de fechar ao abrir', () => {
    render(
      <Drawer open title="t" onClose={vi.fn()}>
        c
      </Drawer>,
    )
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
  })

  it('chama onClose ao clicar no overlay e no botao de fechar', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <Drawer open title="t" onClose={onClose}>
        c
      </Drawer>,
    )

    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('dialog').parentElement)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('nao chama onClose ao clicar dentro do drawer', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <Drawer open title="Titulo" onClose={onClose}>
        c
      </Drawer>,
    )
    await user.click(screen.getByText('Titulo'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('chama onClose ao pressionar Escape', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <Drawer open title="t" onClose={onClose}>
        c
      </Drawer>,
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
