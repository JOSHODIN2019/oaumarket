import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getAdminSession, clearAdminSession } from '../../lib/session'

const LINKS = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/moderation', label: 'Moderation' },
  { to: '/admin/transactions', label: 'Transactions' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/audit-logs', label: 'Audit Log' },
]

export default function AdminNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getAdminSession()

  const handleLogout = () => {
    clearAdminSession()
    navigate('/admin/login')
  }

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: '64px', borderBottom: '1px solid #e8e8ed',
      background: '#0d0c22', fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '18px', color: '#fff' }}>
          OAU<span style={{ color: '#9945FF' }}>Market</span> <span style={{ fontWeight: 500, color: '#8888a0', fontSize: '13px' }}>Admin</span>
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                textDecoration: 'none',
                color: location.pathname === link.to ? '#fff' : '#a0a0b8',
                background: location.pathname === link.to ? 'rgba(153,69,255,0.25)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '13px', color: '#a0a0b8' }}>{session?.admin?.name}</span>
        <button
          onClick={handleLogout}
          style={{ background: 'none', border: '1px solid #33334d', color: '#fff', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
        >
          Log out
        </button>
      </div>
    </nav>
  )
}
