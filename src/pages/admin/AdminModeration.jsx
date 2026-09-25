import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { colors } from '../../components/ui/tokens'
import { getAdminSession } from '../../lib/session'
import { fetchAdminSummary, suspendUser, reinstateUser, fetchAdminReports, resolveReport } from '../../lib/api'

export default function AdminModeration() {
  const session = getAdminSession()
  const token = session?.accessToken
  const [users, setUsers] = useState(undefined)
  const [reports, setReports] = useState(undefined)
  const [pending, setPending] = useState(null)

  const loadUsers = () => {
    fetchAdminSummary(token).then((result) => {
      if (result.status === 'success') setUsers(result.data.users.recent)
    })
  }
  const loadReports = () => {
    fetchAdminReports(token).then((result) => {
      if (result.status === 'success') setReports(result.data)
    })
  }

  useEffect(() => {
    loadUsers()
    loadReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleSuspend = async (user) => {
    setPending(user.id)
    const action = user.suspended ? reinstateUser : suspendUser
    const result = await action(token, user.id)
    if (result.status === 'success') {
      setUsers((current) => current.map((u) => (u.id === user.id ? { ...u, suspended: result.data.suspended } : u)))
    }
    setPending(null)
  }

  const handleResolve = async (report) => {
    setPending(report._id)
    const result = await resolveReport(token, report._id)
    if (result.status === 'success') {
      setReports((current) => current.map((r) => (r._id === report._id ? result.data : r)))
    }
    setPending(null)
  }

  return (
    <AdminLayout maxWidth="1100px" contentStyle={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <Card style={{ flex: 1 }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.text, marginBottom: '14px' }}>Students</h2>
          {users === undefined && <p style={{ fontSize: '13px', color: colors.textMuted }}>Loading…</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {users?.map((u) => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingBottom: '10px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: colors.text, margin: 0 }}>{u.fullName}</p>
                  <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>{u.matricNumber}</p>
                </div>
                <Button
                  variant={u.suspended ? 'accent' : 'danger'}
                  size="sm"
                  loading={pending === u.id}
                  onClick={() => toggleSuspend(u)}
                >
                  {u.suspended ? 'Reinstate' : 'Suspend'}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ flex: 1 }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.text, marginBottom: '14px' }}>Reports</h2>
          {reports === undefined && <p style={{ fontSize: '13px', color: colors.textMuted }}>Loading…</p>}
          {reports?.length === 0 && <p style={{ fontSize: '13px', color: colors.textMuted }}>No reports filed.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reports?.map((r) => (
              <div key={r._id} style={{ paddingBottom: '10px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: colors.text, margin: 0, textTransform: 'uppercase' }}>{r.targetType} report</p>
                    <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '2px 0 0' }}>{r.reason}</p>
                  </div>
                  {!r.resolved ? (
                    <Button variant="secondary" size="sm" loading={pending === r._id} onClick={() => handleResolve(r)}>Resolve</Button>
                  ) : (
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: '#f0fdf4', color: '#15803d', textTransform: 'uppercase' }}>Resolved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
    </AdminLayout>
  )
}
