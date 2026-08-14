import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../../components/ProtectedRoute'

const mockUseAuth = vi.fn()
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderWithRoute(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<div>tela de login</div>} />
        <Route
          path="/mecanicos"
          element={
            <ProtectedRoute>
              <div>conteudo protegido</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('nao renderiza nada enquanto loading e true', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true })
    const { container } = renderWithRoute('/mecanicos')
    expect(container).toBeEmptyDOMElement()
  })

  it('redireciona para /login quando nao ha usuario', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    renderWithRoute('/mecanicos')
    expect(screen.getByText('tela de login')).toBeInTheDocument()
  })

  it('renderiza o conteudo protegido quando ha usuario', () => {
    mockUseAuth.mockReturnValue({ user: { username: 'admin' }, loading: false })
    renderWithRoute('/mecanicos')
    expect(screen.getByText('conteudo protegido')).toBeInTheDocument()
  })
})
