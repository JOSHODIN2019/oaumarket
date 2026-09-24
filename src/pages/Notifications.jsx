import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import TopNav from '../components/home/TopNav'
import { colors } from '../components/ui/tokens'
import { getSession } from '../lib/session'
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/api'

const TYPE_EMOJI = {
  new_message: '💬',
  transaction_completed: '✅',
  transaction_cancelled: '✕',
  offer_received: '💰',
  offer_accepted: '🎉',
  offer_declined: '🚫',
}

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function Notifications() {
  const session = getSession()
  const myId = session?.user?.id
  const [notifs, setNotifs] = useState(undefined)

  useEffect(() => {
    if (!myId) return
    fetchNotifications(myId).then((result) => {
      if (result.status === 'success') setNotifs(result.data)
      else setNotifs([])
    })
  }, [myId])

  const unreadCount = notifs?.filter((n) => !n.read).length || 0

  const markAllRead = async () => {
    await markAllNotificationsRead(myId)
    setNotifs((n) => n.map((x) => ({ ...x, read: true })))
  }

  const markOneRead = async (notif) => {
    if (notif.read) return
    setNotifs((n) => n.map((x) => (x._id === notif._id ? { ...x, read: true } : x)))
    await markNotificationRead(notif._id, myId)
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.surface, fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <TopNav />

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: colors.text, letterSpacing: '-0.4px', marginBottom: '4px', fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif" }}>
              Notifications 🔔
            </h1>
            <p style={{ fontSize: '14px', color: colors.textSecondary }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                background: 'none', border: `1.5px solid ${colors.border}`, padding: '8px 16px',
                borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: colors.textSecondary,
                fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              Mark all read
            </button>
          )}
        </motion.div>

        {notifs === undefined && <p style={{ color: colors.textSecondary, fontSize: '14px' }}>Loading…</p>}
        {notifs?.length === 0 && <p style={{ color: colors.textSecondary, fontSize: '14px' }}>No notifications yet.</p>}

        {notifs?.length > 0 && (
          <div style={{ background: colors.bg, borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            {notifs.map((notif, i) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
                onClick={() => markOneRead(notif)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  padding: '16px 20px',
                  background: !notif.read ? 'rgba(153,69,255,0.06)' : colors.bg,
                  borderBottom: i < notifs.length - 1 ? `1px solid ${colors.border}` : 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: colors.surfaceHover, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  {TYPE_EMOJI[notif.type] || '🔔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <p style={{ fontSize: '14px', fontWeight: !notif.read ? 700 : 600, color: colors.text, margin: 0 }}>
                      {notif.message}
                    </p>
                    {!notif.read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#9945FF', flexShrink: 0 }} />}
                  </div>
                  <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>{timeAgo(notif.createdAt)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
