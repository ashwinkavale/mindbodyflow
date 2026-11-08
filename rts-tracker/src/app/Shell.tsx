import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { CalendarCheck, Flag, Footprints, Gauge, Library, Moon, Sun, Target, Trophy, UserRound } from 'lucide-react'
import { useApp } from './store'
import { useTheme } from '../hooks/useTheme'

const NAV = [
  { to: '/today', label: 'Today', Icon: CalendarCheck }, { to: '/progress', label: 'Progress', Icon: Gauge },
  { to: '/skills', label: 'Skills', Icon: Library }, { to: '/next-step', label: 'Next', Icon: Target },
  { to: '/milestones', label: 'Milestones', Icon: Trophy }, { to: '/challenges', label: 'Challenges', Icon: Flag },
  { to: '/profile', label: 'Profile', Icon: UserRound },
]

export default function Shell() {
  const { state, toast } = useApp()
  const { dark, setMode } = useTheme()
  if (!state.profile) return <Navigate to="/onboarding" replace />
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><Footprints size={18} style={{ verticalAlign: -2, marginRight: 8 }} />RTS Tracker</div>
        <nav className="nav" aria-label="Primary">
          {NAV.map(({ to, label, Icon }) => <NavLink key={to} to={to}><Icon size={19} />{label}</NavLink>)}
        </nav>
        <button className="theme-btn" onClick={() => setMode(dark ? 'light' : 'dark')}>
          {dark ? <Sun size={19} /> : <Moon size={19} />}{dark ? 'Light theme' : 'Dark theme'}
        </button>
      </aside>
      <main className="main"><Outlet /></main>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}