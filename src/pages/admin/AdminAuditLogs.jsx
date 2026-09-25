import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import Card from '../../components/ui/Card'
import { colors } from '../../components/ui/tokens'
import { getAdminSession } from '../../lib/session'
import { fetchAdminAuditLogs } from '../../lib/api'

const ACTION_LABELS = {
  'user.suspend': 'Suspended a student',
  'user.reinstate': 'Reinstated a student',
  'transaction.flag': 'Flagged a transaction',
  'transaction.unflag': 'Unflagged a transaction',
  'category.create': 'Created a category',
  'category.update': 'Updated a category',
  'category.delete': 'Deleted a category',
  'report.resolve': 'Resolved a report',
}

export default function AdminAuditLogs() {
  const session = getAdminSession()
  const [logs, setLogs] = useState(undefined)

  useEffect(() => {
    fetchAdminAuditLogs(session?.accessToken).then((result) => {
      if (result.status === 'success') setLogs(result.data)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AdminLayout maxWidth="760px">
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.text, marginBottom: '20px' }}>Audit Log</h1>

        {logs === undefined && <p style={{ color: colors.textSecondary, fontSize: '14px' }}>Loading…</p>}
        {logs?.length === 0 && <p style={{ color: colors.textMuted, fontSize: '14px' }}>No admin actions recorded yet.</p>}

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {logs?.map((log, i) => (
            <div
              key={log._id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
                padding: '14px 20px', borderBottom: i < logs.length - 1 ? `1px solid ${colors.border}` : 'none',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: colors.text, margin: 0 }}>
                  {ACTION_LABELS[log.action] || log.action}
                  {log.detail ? ` — ${log.detail}` : ''}
                </p>
                <p style={{ fontSize: '12px', color: colors.textMuted, margin: '2px 0 0' }}>by {log.adminName} · target {log.targetId.slice(-6)}</p>
              </div>
              <span style={{ fontSize: '12px', color: colors.textMuted, whiteSpace: 'nowrap' }}>
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </Card>
    </AdminLayout>
  )
}
