import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getSession, clearSession } from '../../lib/session'
import { fetchNotifications } from '../../lib/api'
import { colors } from '../ui/tokens'
import ThemeToggle from '../ui/ThemeToggle'

const NAV_LINKS = [
  { label: 'Marketplace', path: '/home' },
  { label: 'My Listings', path: '/my-listings' },
  { label: 'My Offers', path: '/offers' },
  { label: 'Saved', path: '/saved' },
]

export default function TopNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const session = getSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('Products')
  const [typeOpen, setTypeOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!session?.user?.id) return
    let cancelled = false
    fetchNotifications(session.user.id).then((result) => {
      if (!cancelled && result.status === 'success') {
        setUnreadCount(result.data.filter((n) => !n.read).length)
      }
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  const initials = session?.user?.fullName
    ? session.user.fullName.trim().split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : session?.user?.username?.[0]?.toUpperCase() || 'U'

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/home?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleLogout = () => {
    clearSession()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: colors.bg,
      borderBottom: `1px solid ${colors.border}`,
      fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      padding: '10px 0',
    }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto', padding: '0 20px',
        height: '64px', display: 'flex', alignItems: 'center', gap: '16px',
      }}>

        {/* Logo */}
        <button
          onClick={() => navigate('/home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
        >
          <BallIcon />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '18px', color: colors.text, letterSpacing: '-0.3px' }}>
            OAU<span style={{ color: '#9945FF' }}>Market</span>
          </span>
        </button>

        {/* Embedded search bar */}
        <form onSubmit={handleSearchSubmit} style={{
          flex: 1, maxWidth: '440px',
          display: 'flex', alignItems: 'center',
          background: colors.surfaceHover, borderRadius: '100px',
          padding: '0 6px 0 16px', height: '40px',
          position: 'relative',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="What are you looking for?"
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontSize: '13.5px', fontFamily: 'inherit', color: colors.text,
              padding: '0 10px',
            }}
          />
          {/* Divider */}
          <div style={{ width: '1px', height: '18px', background: colors.borderStrong, marginRight: '8px', flexShrink: 0 }} />
          {/* Type selector */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setTypeOpen(o => !o)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '12.5px', color: colors.textSecondary, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap',
                padding: '4px 2px',
              }}
            >
              {searchType}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {typeOpen && (
              <div style={{
                position: 'absolute', top: '120%', right: 0,
                background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.10)', overflow: 'hidden',
                zIndex: 50, minWidth: '120px',
              }}>
                {['Products'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setSearchType(t); setTypeOpen(false) }}
                    style={{
                      display: 'block', width: '100%', padding: '10px 16px',
                      background: searchType === t ? colors.surface : 'none',
                      border: 'none', textAlign: 'left', cursor: 'pointer',
                      fontSize: '13px', color: searchType === t ? colors.text : colors.textSecondary,
                      fontWeight: searchType === t ? 600 : 400, fontFamily: 'inherit',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Submit button */}
          <button
            type="submit"
            style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: '#9945FF', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.15s', marginLeft: '6px',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#7a2de6'}
            onMouseLeave={e => e.currentTarget.style.background = '#9945FF'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.path
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  background: isActive ? colors.surfaceHover : 'none',
                  border: 'none', cursor: 'pointer',
                  padding: '7px 13px', borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? colors.text : colors.textSecondary,
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = colors.surface; e.currentTarget.style.color = colors.text } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = colors.textSecondary } }}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          <ThemeToggle />

          <button
            onClick={() => navigate('/sell')}
            style={{
              padding: '7px 16px', borderRadius: '8px',
              border: `1.5px solid ${colors.border}`, background: colors.bg,
              color: colors.text, fontSize: '13px', fontWeight: 600,
              fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#9945FF'; e.currentTarget.style.color = '#9945FF' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.text }}
          >
            + Sell
          </button>

          <button
            onClick={() => navigate('/messages')}
            title="Messages"
            aria-label="Messages"
            style={{
              width: '36px', height: '36px', borderRadius: '8px',
              border: `1.5px solid ${colors.border}`, background: colors.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s', color: colors.textSecondary,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = colors.text; e.currentTarget.style.color = colors.text }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textSecondary }}
          >
            <ChatIcon />
          </button>

          <button
            onClick={() => navigate('/notifications')}
            style={{
              position: 'relative',
              width: '36px', height: '36px', borderRadius: '8px',
              border: `1.5px solid ${colors.border}`, background: colors.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s', color: colors.textSecondary,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = colors.text; e.currentTarget.style.color = colors.text }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textSecondary }}
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                minWidth: '16px', height: '16px', borderRadius: '8px',
                background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: session?.user?.avatarUrl ? `url(${session.user.avatarUrl})` : 'linear-gradient(135deg, #9945FF, #14F195)',
              backgroundSize: 'cover', backgroundPosition: 'center',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: '#ffffff',
              fontFamily: "'Outfit', sans-serif", flexShrink: 0, cursor: 'pointer',
            }}
          >
            {!session?.user?.avatarUrl && initials}
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: '46px', right: 0,
              background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
              zIndex: 50, minWidth: '180px',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}` }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: colors.text, margin: 0 }}>{session?.user?.fullName}</p>
                <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>@{session?.user?.username}</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate('/profile/edit') }}
                style={{
                  display: 'block', width: '100%', padding: '12px 16px',
                  background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                  fontSize: '13px', color: colors.text, fontWeight: 600, fontFamily: 'inherit',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                style={{
                  display: 'block', width: '100%', padding: '12px 16px',
                  background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                  fontSize: '13px', color: '#ef4444', fontWeight: 600, fontFamily: 'inherit',
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function BallIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="nav-clip"><circle cx="32" cy="32" r="30" /></clipPath></defs>
      <g clipPath="url(#nav-clip)" stroke="#9945FF" strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M 32,2 C 6,10 6,54 32,62" />
        <path d="M 32,2 C 58,10 58,54 32,62" />
        <path d="M 2,32 C 18,8 46,56 62,32" />
      </g>
      <circle cx="32" cy="32" r="30" stroke="#9945FF" strokeWidth="4" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}
