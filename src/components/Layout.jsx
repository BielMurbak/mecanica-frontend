import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { List, SignOut, Wrench, ClipboardText, X } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'

export function Layout() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { to: '/mecanicos', label: 'Mecânicos', icon: Wrench },
    { to: '/servicos', label: 'Serviços', icon: ClipboardText },
  ]

  return (
    <div className="app-shell">
      <button
        type="button"
        className="icon-button topbar-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
      >
        <List size={22} />
      </button>

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <nav className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <span className="sidebar__brand">Gestão de Mecânica</span>
          <button
            type="button"
            className="icon-button sidebar__close"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar__nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sidebar__footer">
          <div className="sidebar__user">{user?.username}</div>
          <button type="button" className="sidebar__logout" onClick={logout}>
            <SignOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </nav>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
