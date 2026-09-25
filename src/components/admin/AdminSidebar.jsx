import { Link, useNavigate, useLocation } from 'react-router-dom'
import { colors } from '../ui/tokens'
import ThemeToggle from '../ui/ThemeToggle'
import { getAdminSession, clearAdminSession } from '../../lib/session'

const LINKS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/moderation', label: 'Moderation' },
  { to: '/admin/transactions', label: 'Transactions' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/audit-logs', label: 'Audit Log' },
]

export default function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getAdminSession()

  const handleLogout = () => {
    clearAdminSession()
    navigate('/admin/login')
  }

  return (
    <aside style={{
      position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
      width: '220px', display: 'flex', flexDirection: 'column',
      background: colors.bg, borderRight: `1px solid ${colors.border}`,
      fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      <div style={{ padding: '20px 20px 16px' }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '18px', color: colors.text }}>
          OAU<span style={{ color: '#9945FF' }}>Market</span>
        </span>
        <p style={{ fontSize: '12px', color: colors.textMuted, margin: '2px 0 0' }}>Admin Console</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 12px', flex: 1 }}>
        {LINKS.map((link) => {
          const isActive = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '10px 12px', borderRadius: '8px', fontSize: '13.5px', fontWeight: 600,
                textDecoration: 'none',
                color: isActive ? colors.text : colors.textSecondary,
                background: isActive ? colors.surfaceHover : 'transparent',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session?.admin?.name}
          </span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'none', border: `1px solid ${colors.border}`, color: colors.text,
            padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Log out
        </button>
      </div>
    </aside>
  )
}
