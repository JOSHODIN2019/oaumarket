import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../components/home/TopNav'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { colors } from '../components/ui/tokens'
import { getSession } from '../lib/session'
import { fetchOffersForUser, acceptOffer, declineOffer, withdrawOffer, fetchProductById } from '../lib/api'

const STATUS_STYLES = {
  pending: { bg: '#eef2ff', color: '#4338ca' },
  accepted: { bg: '#f0fdf4', color: '#15803d' },
  declined: { bg: '#fef2f2', color: '#b91c1c' },
  withdrawn: { bg: colors.surfaceHover, color: colors.textMuted },
}

export default function MyOffers() {
  const session = getSession()
  const myId = session?.user?.id
  const [offers, setOffers] = useState(undefined)
  const [titles, setTitles] = useState({})
  const [pending, setPending] = useState(null)

  const load = () => {
    fetchOffersForUser(myId).then((result) => {
      if (result.status === 'success') setOffers(result.data)
    })
  }

  useEffect(() => {
    if (myId) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId])

  useEffect(() => {
    if (!offers) return
    const allIds = offers.flatMap((o) => [o.productId, o.offeredProductId]).filter(Boolean)
    const idsToResolve = [...new Set(allIds)].filter((id) => !(id in titles))
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
  }, [offers])

  const runAction = async (offer, action) => {
    setPending(offer._id)
    const result = await action(offer._id, myId)
    if (result.status === 'success') {
      setOffers((current) => current.map((o) => (o._id === offer._id ? result.data : o)))
    }
    setPending(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <TopNav />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, marginBottom: '4px' }}>My Offers</h1>
        <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '28px' }}>Offers you've made, and offers you've received.</p>

        {offers === undefined && <p style={{ color: colors.textSecondary, fontSize: '14px' }}>Loading…</p>}
        {offers?.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '48px 20px' }}>
            <p style={{ fontWeight: 600, color: colors.text }}>No offers yet</p>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {offers?.map((offer) => {
            const isBuyer = offer.buyerId === myId
            const style = STATUS_STYLES[offer.status]
            return (
              <Card key={offer._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ minWidth: 0 }}>
                    <Link to={`/product/${offer.productId}`} style={{ fontSize: '14px', fontWeight: 600, color: colors.text, textDecoration: 'none' }}>
                      {titles[offer.productId] || 'Loading…'}
                    </Link>
                    <p style={{ fontSize: '12px', color: colors.textMuted, margin: '2px 0 0' }}>{isBuyer ? 'You offered' : 'Offer received'}</p>
                  </div>
                  {offer.offerType === 'barter' ? (
                    <span style={{ fontSize: '13px', fontWeight: 700, color: colors.primary, whiteSpace: 'nowrap' }}>🔁 Trade</span>
                  ) : (
                    <span style={{ fontSize: '14px', fontWeight: 700, color: colors.primary, whiteSpace: 'nowrap' }}>₦{offer.offerAmount.toLocaleString()}</span>
                  )}
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase', background: style.bg, color: style.color, height: 'fit-content' }}>
                    {offer.status}
                  </span>
                </div>
                {offer.offerType === 'barter' && (
                  <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0 0 8px' }}>
                    In exchange for: <Link to={`/product/${offer.offeredProductId}`} style={{ color: colors.text, fontWeight: 600 }}>{titles[offer.offeredProductId] || 'Loading…'}</Link>
                  </p>
                )}
                {offer.message && <p style={{ fontSize: '13px', color: colors.textSecondary, fontStyle: 'italic', margin: '0 0 8px' }}>"{offer.message}"</p>}
                {offer.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isBuyer ? (
                      <Button variant="ghost" size="sm" loading={pending === offer._id} onClick={() => runAction(offer, withdrawOffer)}>Withdraw</Button>
                    ) : (
                      <>
                        <Button variant="accent" size="sm" loading={pending === offer._id} onClick={() => runAction(offer, acceptOffer)}>Accept</Button>
                        <Button variant="ghost" size="sm" loading={pending === offer._id} onClick={() => runAction(offer, declineOffer)}>Decline</Button>
                      </>
                    )}
                  </div>
                )}
                {offer.status === 'accepted' && offer.transactionId && (
                  <Link to="/transactions" style={{ fontSize: '13px', color: colors.primary, fontWeight: 600 }}>View Transaction →</Link>
                )}
                {offer.status === 'accepted' && offer.offerType === 'barter' && (
                  <p style={{ fontSize: '13px', color: '#15803d', fontWeight: 600, margin: 0 }}>✓ Trade agreed — arrange the swap via Messages</p>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
