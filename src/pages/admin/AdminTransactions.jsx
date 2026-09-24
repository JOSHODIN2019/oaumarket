import { useEffect, useState } from 'react'
import AdminNav from '../../components/admin/AdminNav'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Input'
import { colors, fontFamily } from '../../components/ui/tokens'
import { getAdminSession } from '../../lib/session'
import { fetchAdminTransactions, flagTransaction, unflagTransaction } from '../../lib/api'

const STATUS_STYLES = {
  pending: { bg: '#eef2ff', color: '#4338ca' },
  completed: { bg: '#f0fdf4', color: '#15803d' },
  cancelled: { bg: '#f3f3f4', color: colors.textMuted },
}

const PAYMENT_LABELS = {
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  cash_on_pickup: 'Cash on Pickup',
}

export default function AdminTransactions() {
  const session = getAdminSession()
  const token = session?.accessToken
  const [transactions, setTransactions] = useState(undefined)
  const [pending, setPending] = useState(null)
  const [flagTarget, setFlagTarget] = useState(null)
  const [reason, setReason] = useState('')

  const load = () => {
    fetchAdminTransactions(token).then((result) => {
      if (result.status === 'success') setTransactions(result.data)
    })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFlag = async () => {
    setPending(flagTarget.id)
    const result = await flagTransaction(token, flagTarget.id, reason.trim() || 'Flagged for review')
    if (result.status === 'success') {
      setTransactions((current) => current.map((t) => (t.id === flagTarget.id ? { ...t, flagged: true, flagReason: reason.trim() || 'Flagged for review' } : t)))
    }
    setPending(null)
    setFlagTarget(null)
    setReason('')
  }

  const handleUnflag = async (t) => {
    setPending(t.id)
    const result = await unflagTransaction(token, t.id)
    if (result.status === 'success') {
      setTransactions((current) => current.map((x) => (x.id === t.id ? { ...x, flagged: false, flagReason: undefined } : x)))
    }
    setPending(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.surface, fontFamily }}>
      <AdminNav />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 80px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.text, marginBottom: '20px' }}>Transactions</h1>

        {transactions === undefined && <p style={{ color: colors.textSecondary, fontSize: '14px' }}>Loading…</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {transactions?.map((t) => {
            const style = STATUS_STYLES[t.status]
            return (
              <Card key={t.id} style={{ borderColor: t.flagged ? colors.danger : colors.border }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: colors.text, margin: 0 }}>Transaction {t.id.slice(-6)}</p>
                    <p style={{ fontSize: '12px', color: colors.textMuted, margin: '2px 0 0' }}>
                      Product {t.productId.slice(-6)} · ₦{t.amount.toLocaleString()} · {PAYMENT_LABELS[t.paymentMethod] || t.paymentMethod}
                      {t.paymentReference ? ` · Ref: ${t.paymentReference}` : ''}
                    </p>
                    {t.flagged && <p style={{ fontSize: '12px', color: colors.danger, margin: '4px 0 0', fontWeight: 600 }}>⚑ {t.flagReason}</p>}
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', background: style.bg, color: style.color, whiteSpace: 'nowrap' }}>
                    {t.status}
                  </span>
                  {t.flagged ? (
                    <Button variant="secondary" size="sm" loading={pending === t.id} onClick={() => handleUnflag(t)}>Unflag</Button>
                  ) : (
                    <Button variant="danger" size="sm" loading={pending === t.id} onClick={() => setFlagTarget(t)}>Flag</Button>
                  )}
                </div>
              </Card>
            )
          })}
          {transactions?.length === 0 && <p style={{ fontSize: '14px', color: colors.textMuted }}>No transactions yet.</p>}
        </div>
      </div>

      <Modal open={!!flagTarget} onClose={() => setFlagTarget(null)} title="Flag Transaction">
        <Textarea label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Why is this transaction being flagged?" />
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <Button variant="danger" loading={pending === flagTarget?.id} onClick={handleFlag} style={{ flex: 1 }}>Flag</Button>
          <Button variant="secondary" onClick={() => setFlagTarget(null)} style={{ flex: 1 }}>Cancel</Button>
        </div>
      </Modal>
    </div>
  )
}
