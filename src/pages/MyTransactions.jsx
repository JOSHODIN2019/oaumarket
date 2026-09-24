import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../components/home/TopNav'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { colors } from '../components/ui/tokens'
import { getSession } from '../lib/session'
import { fetchTransactionsForUser, updateTransactionStatus, fetchProductById } from '../lib/api'

const STATUS_STYLES = {
  pending: { bg: '#eef2ff', color: '#4338ca' },
  completed: { bg: '#f0fdf4', color: '#15803d' },
  cancelled: { bg: colors.surfaceHover, color: colors.textMuted },
}

const PAYMENT_LABELS = {
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  cash_on_pickup: 'Cash on Pickup',
}

export default function MyTransactions() {
  const session = getSession()
  const myId = session?.user?.id
  const [transactions, setTransactions] = useState(undefined)
  const [titles, setTitles] = useState({})
  const [pending, setPending] = useState(null)

  const load = () => {
    fetchTransactionsForUser(myId).then((result) => {
      if (result.status === 'success') setTransactions(result.data)
    })
  }

  useEffect(() => {
    if (myId) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId])

  useEffect(() => {
    if (!transactions) return
    const idsToResolve = [...new Set(transactions.map((t) => t.productId))].filter((id) => !(id in titles))
    if (idsToResolve.length === 0) return
    Promise.all(idsToResolve.map((id) => fetchProductById(id))).then((results) => {
      setTitles((current) => {
        const next = { ...current }
        results.forEach((result, i) => {
          next[idsToResolve[i]] = result.status === 'success' ? result.data.title : 'Listing removed'
        })
        return next
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions])

  const updateStatus = async (transaction, status) => {
    setPending(transaction._id)
    const result = await updateTransactionStatus(transaction._id, status, myId)
    if (result.status === 'success') {
      setTransactions((current) => current.map((t) => (t._id === transaction._id ? result.data : t)))
    }
    setPending(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <TopNav />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, marginBottom: '4px' }}>My Transactions</h1>
        <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '28px' }}>Every purchase and sale, with its current status.</p>

        {transactions === undefined && <p style={{ color: colors.textSecondary, fontSize: '14px' }}>Loading…</p>}
        {transactions?.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '48px 20px' }}>
            <p style={{ fontWeight: 600, color: colors.text }}>No transactions yet</p>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {transactions?.map((t) => {
            const isBuyer = t.buyerId === myId
            const style = STATUS_STYLES[t.status]
            return (
              <Card key={t._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: t.status === 'pending' ? '10px' : 0 }}>
                  <div style={{ minWidth: 0 }}>
                    <Link to={`/product/${t.productId}`} style={{ fontSize: '14px', fontWeight: 600, color: colors.text, textDecoration: 'none' }}>
                      {titles[t.productId] || 'Loading…'}
                    </Link>
                    <p style={{ fontSize: '12px', color: colors.textMuted, margin: '2px 0 0' }}>
                      {isBuyer ? 'Buying' : 'Selling'} · {PAYMENT_LABELS[t.paymentMethod] || t.paymentMethod}
                      {t.paymentReference ? ` · Ref: ${t.paymentReference}` : ''}
                    </p>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: colors.primary, whiteSpace: 'nowrap' }}>₦{t.amount.toLocaleString()}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', background: style.bg, color: style.color, height: 'fit-content' }}>
                    {t.status}
                  </span>
                </div>
                {t.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="accent" size="sm" loading={pending === t._id} onClick={() => updateStatus(t, 'completed')}>Mark Completed</Button>
                    <Button variant="ghost" size="sm" loading={pending === t._id} onClick={() => updateStatus(t, 'cancelled')}>Cancel</Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
