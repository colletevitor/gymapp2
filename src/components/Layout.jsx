import { NavLink, useLocation } from 'react-router-dom'
import { Dumbbell, Clock, TrendingUp, BookOpen, LayoutGrid } from 'lucide-react'
import { useStore } from '../store/index'

const navItems = [
  { to: '/', icon: LayoutGrid, label: 'Início' },
  { to: '/historico', icon: Clock, label: 'Histórico' },
  { to: '/progresso', icon: TrendingUp, label: 'Progresso' },
  { to: '/fichas', icon: BookOpen, label: 'Fichas' },
  { to: '/exercicios', icon: Dumbbell, label: 'Exercícios' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const activeSession = useStore(s => s.activeSession)

  if (location.pathname === '/treino') {
    return <div className="app">{children}</div>
  }

  return (
    <div className="app">
      <div className="page">{children}</div>
      {activeSession && (
        <NavLink
          to="/treino"
          style={{
            position: 'fixed',
            bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--accent)',
            color: 'var(--accent-text)',
            borderRadius: '99px',
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 150,
            textDecoration: 'none',
            boxShadow: '0 0 20px color-mix(in srgb, var(--accent) 30%, transparent)',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-text)' }} />
          Treino em andamento
        </NavLink>
      )}
      <nav className="bottom-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
