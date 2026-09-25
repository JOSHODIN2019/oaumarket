import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import Card from '../../components/ui/Card'
import { colors } from '../../components/ui/tokens'
import { getAdminSession } from '../../lib/session'
import { fetchAdminSummary } from '../../lib/api'

function StatCard({ label, value, accent }) {
  return (
    <Card style={{ flex: 1 }}>
      <p style={{ fontSize: '12px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>{label}</p>
      <p style={{ fontSize: '30px', fontWeight: 700, color: accent || colors.text }}>{value}</p>
    </Card>
  )
}

export default function AdminDashboard() {
  const session = getAdminSession()
  const [summary, setSummary] = useState(undefined)

  useEffect(() => {
    fetchAdminSummary(session?.accessToken).then((result) => {
      if (result.status === 'success') setSummary(result.data)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AdminLayout maxWidth="1100px">
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.text, marginBottom: '24px' }}>Overview</h1>

        {summary === undefined && <p style={{ color: colors.textSecondary, fontSize: '14px' }}>Loading…</p>}

        {summary && (
          <>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
              <StatCard label="Students" value={summary.users.count} />
              <StatCard label="Listings" value={summary.products.count} />
              <StatCard label="Transactions" value={summary.transactions.count} />
              <StatCard label="Flagged" value={summary.flaggedTransactions.count} accent={summary.flaggedTransactions.count > 0 ? colors.danger : colors.text} />
              <StatCard label="Unread Notifs" value={summary.notifications.unreadCount} />
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <Card style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.text }}>Recent Students</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {summary.users.recent.map((u) => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: colors.text }}>{u.fullName}</span>
                        <span style={{ color: colors.textMuted }}> · {u.matricNumber}</span>
                      </div>
                      {u.suspended && (
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: '#fef2f2', color: colors.danger, textTransform: 'uppercase' }}>Suspended</span>
                      )}
                    </div>
                  ))}
                  {summary.users.recent.length === 0 && <p style={{ fontSize: '13px', color: colors.textMuted }}>No students yet.</p>}
                </div>
              </Card>

              <Card style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.text }}>Flagged Transactions</h2>
                  <Link to="/admin/transactions" style={{ fontSize: '12px', color: colors.primary, fontWeight: 600 }}>View all →</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {summary.flaggedTransactions.recent.map((t) => (
                    <div key={t.id} style={{ fontSize: '13px' }}>
                      <span style={{ fontWeight: 600, color: colors.text }}>{t.buyerName}</span>
                      <span style={{ color: colors.textMuted }}> → {t.sellerName} · ₦{t.amount.toLocaleString()}</span>
                      {t.flagReason && <p style={{ fontSize: '12px', color: colors.danger, margin: '2px 0 0' }}>{t.flagReason}</p>}
                    </div>
                  ))}
                  {summary.flaggedTransactions.recent.length === 0 && <p style={{ fontSize: '13px', color: colors.textMuted }}>Nothing flagged.</p>}
                </div>
              </Card>
            </div>
          </>
        )}
    </AdminLayout>
  )
}
