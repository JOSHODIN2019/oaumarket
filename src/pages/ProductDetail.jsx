import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import TopNav from '../components/home/TopNav'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { Textarea, Input, Select } from '../components/ui/Input'
import { colors } from '../components/ui/tokens'
import { getSession } from '../lib/session'
import {
  fetchProductById,
  fetchProductsBySeller,
  fetchPublicUser,
  fetchFavorites,
  saveFavorite,
  removeFavorite,
  createTransaction,
  createOffer,
  sendMessage,
  createReport,
} from '../lib/api'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const session = getSession()
  const myId = session?.user?.id

  const [product, setProduct] = useState(undefined)
  const [seller, setSeller] = useState(undefined)
  const [isFavorited, setIsFavorited] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)
  const [offerType, setOfferType] = useState('cash')
  const [offerAmount, setOfferAmount] = useState('')
  const [offeredProductId, setOfferedProductId] = useState('')
  const [myListings, setMyListings] = useState(undefined)
  const [offerMessage, setOfferMessage] = useState('')
  const [offerSubmitting, setOfferSubmitting] = useState(false)
  const [offerSent, setOfferSent] = useState(false)
  const [offerError, setOfferError] = useState('')
  const [messageOpen, setMessageOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [messageSending, setMessageSending] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [buying, setBuying] = useState(false)
  const [buyError, setBuyError] = useState('')
  const [bought, setBought] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState('product')
  const [reportReason, setReportReason] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSent, setReportSent] = useState(false)

  useEffect(() => {
    fetchProductById(id).then((result) => {
      if (result.status === 'success') {
        setProduct(result.data)
        fetchPublicUser(result.data.sellerId).then((sellerResult) => {
          setSeller(sellerResult.status === 'success' ? sellerResult.data : null)
        })
      } else {
        setProduct(null)
      }
    })
  }, [id])

  useEffect(() => {
    if (!myId) return
    fetchFavorites(myId).then((result) => {
      if (result.status === 'success') setIsFavorited(result.data.includes(id))
    })
  }, [myId, id])

  const toggleFavorite = () => {
    if (!myId) return
    const next = !isFavorited
    setIsFavorited(next)
    if (next) saveFavorite(myId, id)
    else removeFavorite(myId, id)
  }

  const isOwnListing = product && myId === product.sellerId

  const handlePay = async () => {
    setBuying(true)
    setBuyError('')
    // No real payment gateway is connected - this is a simulated
    // checkout for the demo, with a short fake "processing" delay
    // before the transaction is recorded.
    await new Promise((resolve) => setTimeout(resolve, 1400))
    const result = await createTransaction({
      buyerId: myId,
      sellerId: product.sellerId,
      productId: product._id,
      amount: product.price,
      paymentMethod,
    })
    setBuying(false)
    if (result.status === 'success') {
      setReceipt(result.data)
      setBought(true)
      setPayOpen(false)
    } else if (result.status === 'network-error') {
      setBuyError("Couldn't reach the server.")
    } else {
      setBuyError(result.message || 'Something went wrong.')
    }
  }

  const openOfferModal = () => {
    setOfferOpen(true)
    setOfferType('cash')
    setOfferAmount('')
    setOfferedProductId('')
    setOfferError('')
    setOfferSent(false)
    if (myListings === undefined) {
      fetchProductsBySeller(myId).then((result) => {
        setMyListings(result.status === 'success' ? result.data.filter((p) => p.available && p._id !== product._id) : [])
      })
    }
  }

  const handleSendOffer = async () => {
    setOfferSubmitting(true)
    setOfferError('')
    const payload = {
      productId: product._id,
      buyerId: myId,
      sellerId: product.sellerId,
      offerType,
      message: offerMessage.trim() || undefined,
    }
    if (offerType === 'cash') payload.offerAmount = Number(offerAmount)
    else payload.offeredProductId = offeredProductId

    const result = await createOffer(payload)
    setOfferSubmitting(false)
    if (result.status === 'success') {
      setOfferSent(true)
    } else if (result.status === 'network-error') {
      setOfferError("Couldn't reach the server.")
    } else {
      setOfferError(result.message || 'Something went wrong.')
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) return
    setMessageSending(true)
    const result = await sendMessage({
      productId: product._id,
      productTitle: product.title,
      buyerId: myId,
      buyerName: session.user.fullName,
      sellerId: product.sellerId,
      sellerName: seller?.fullName || 'Seller',
      senderId: myId,
      text: messageText.trim(),
    })
    setMessageSending(false)
    if (result.status === 'success') {
      setMessageSent(true)
      setTimeout(() => navigate('/messages'), 900)
    }
  }

  const handleSendReport = async () => {
    if (!reportReason.trim()) return
    setReportSubmitting(true)
    const result = await createReport({
      reporterId: myId,
      targetType: reportTarget,
      targetId: reportTarget === 'product' ? product._id : product.sellerId,
      reason: reportReason.trim(),
    })
    setReportSubmitting(false)
    if (result.status === 'success') setReportSent(true)
  }

  if (product === undefined) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg }}>
        <TopNav />
        <p style={{ textAlign: 'center', padding: '80px 0', color: colors.textSecondary }}>Loading…</p>
      </div>
    )
  }

  if (product === null) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg }}>
        <TopNav />
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <h1 style={{ color: colors.text }}>Listing not found</h1>
          <Button variant="secondary" onClick={() => navigate('/home')} style={{ marginTop: '16px' }}>Back to Marketplace</Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <TopNav />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '40px' }}>
        <div>
          <div style={{ borderRadius: '16px', overflow: 'hidden', aspectRatio: '4/3', background: colors.surfaceHover, position: 'relative' }}>
            {product.imageUrls?.[0] ? (
              <img src={product.imageUrls[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #9945FF33, #14F19533)' }} />
            )}
            {!product.available && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,12,34,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '6px 16px', borderRadius: '6px', textTransform: 'uppercase' }}>Sold</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '12px', color: colors.primary, fontWeight: 700, textTransform: 'uppercase' }}>{product.condition}</span>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: colors.text, margin: '6px 0 10px' }}>{product.title}</h1>
          <p style={{ fontSize: '24px', fontWeight: 700, color: colors.primary, marginBottom: '16px' }}>₦{product.price.toLocaleString()}</p>
          <p style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: 1.6, marginBottom: '16px' }}>{product.description}</p>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>📍 {product.location}</p>

          {seller && (
            <Link to={`/seller/${seller.id}`} style={{ textDecoration: 'none' }}>
              <Card style={{ padding: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                {seller.avatarUrl ? (
                  <img src={seller.avatarUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #9945FF, #14F195)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>
                    {seller.fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: colors.text, margin: 0 }}>{seller.fullName}</p>
                  <p style={{ fontSize: '12px', color: colors.textMuted, margin: 0 }}>@{seller.username}</p>
                </div>
              </Card>
            </Link>
          )}

          {seller && !isOwnListing && (
            <button
              onClick={() => setReportOpen(true)}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: colors.danger, fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                marginBottom: '20px', display: 'block', fontFamily: 'inherit',
              }}
            >
              Report this listing or seller
            </button>
          )}

          {!isOwnListing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bought ? (
                <Card style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <p style={{ color: '#15803d', fontWeight: 700, margin: '0 0 4px' }}>✓ Payment simulated successfully</p>
                  <p style={{ color: '#166534', fontSize: '12px', margin: 0, fontFamily: 'monospace' }}>Ref: {receipt?.paymentReference}</p>
                </Card>
              ) : (
                <Button variant="accent" size="lg" disabled={!product.available} onClick={() => setPayOpen(true)}>
                  {product.available ? 'Buy Now' : 'Sold'}
                </Button>
              )}
              {buyError && <span style={{ fontSize: '12px', color: colors.danger }}>{buyError}</span>}

              <Button variant="secondary" size="lg" disabled={!product.available} onClick={openOfferModal}>
                Make an Offer
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setMessageOpen(true)}>
                Message Seller
              </Button>
              <Button variant="ghost" size="md" onClick={toggleFavorite}>
                {isFavorited ? '♥ Saved' : '♡ Save'}
              </Button>
            </div>
          )}
          {isOwnListing && (
            <p style={{ fontSize: '13px', color: colors.textMuted }}>This is your own listing.</p>
          )}
        </div>
      </div>

      <Modal open={payOpen} onClose={() => { if (!buying) setPayOpen(false) }} title="Checkout">
        {buying ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{
              width: '32px', height: '32px', margin: '0 auto 16px',
              border: `3px solid ${colors.border}`, borderTopColor: colors.primary,
              borderRadius: '50%', animation: 'sm-spin 0.7s linear infinite',
            }} />
            <style>{'@keyframes sm-spin { to { transform: rotate(360deg) } }'}</style>
            <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0 }}>Processing payment (simulated)…</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
              This is a simulated checkout — no real payment gateway is connected.
            </p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: colors.text, margin: 0 }}>₦{product.price.toLocaleString()}</p>
            <Select label="Payment method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash_on_pickup">Cash on Pickup</option>
            </Select>
            {paymentMethod !== 'cash_on_pickup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Input label={paymentMethod === 'card' ? 'Card number' : 'Account number'} placeholder={paymentMethod === 'card' ? '4242 4242 4242 4242' : '0123456789'} disabled />
                <p style={{ fontSize: '11px', color: colors.textMuted, margin: 0 }}>Demo field — not sent anywhere.</p>
              </div>
            )}
            {buyError && <span style={{ fontSize: '12px', color: colors.danger }}>{buyError}</span>}
            <Button variant="accent" onClick={handlePay}>
              Pay ₦{product.price.toLocaleString()}
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={offerOpen} onClose={() => setOfferOpen(false)} title="Make an Offer">
        {offerSent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontWeight: 600, color: colors.text }}>Offer sent!</p>
            <p style={{ fontSize: '13px', color: colors.textSecondary }}>The seller will accept or decline it.</p>
            <Button variant="primary" onClick={() => setOfferOpen(false)} style={{ marginTop: '12px' }}>Done</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13px', color: colors.textSecondary }}>Listed price: ₦{product.price.toLocaleString()}</p>

            {/* Cash vs. Trade toggle */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant={offerType === 'cash' ? 'primary' : 'secondary'}
                size="sm"
                style={{ flex: 1 }}
                onClick={() => setOfferType('cash')}
              >
                💰 Offer Cash
              </Button>
              <Button
                variant={offerType === 'barter' ? 'primary' : 'secondary'}
                size="sm"
                style={{ flex: 1 }}
                onClick={() => setOfferType('barter')}
              >
                🔁 Trade an Item
              </Button>
            </div>

            {offerType === 'cash' ? (
              <Input label="Your offer (₦)" type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} placeholder="e.g. 4000" />
            ) : myListings === undefined ? (
              <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>Loading your listings…</p>
            ) : myListings.length === 0 ? (
              <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>
                You don't have any available listings to trade. <Link to="/sell" style={{ color: colors.primary }}>List an item</Link> first.
              </p>
            ) : (
              <Select label="Item you're offering" value={offeredProductId} onChange={(e) => setOfferedProductId(e.target.value)}>
                <option value="">Choose one of your listings…</option>
                {myListings.map((p) => (
                  <option key={p._id} value={p._id}>{p.title} (₦{p.price.toLocaleString()})</option>
                ))}
              </Select>
            )}

            <Textarea label="Message (optional)" value={offerMessage} onChange={(e) => setOfferMessage(e.target.value)} rows={3} />
            {offerError && <span style={{ fontSize: '12px', color: colors.danger }}>{offerError}</span>}
            <Button
              variant="accent"
              disabled={offerType === 'cash' ? !(Number(offerAmount) > 0) : !offeredProductId}
              loading={offerSubmitting}
              onClick={handleSendOffer}
            >
              {offerType === 'cash' ? 'Send Offer' : 'Propose Trade'}
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={messageOpen} onClose={() => setMessageOpen(false)} title="Message Seller">
        {messageSent ? (
          <p style={{ textAlign: 'center', color: colors.text, fontWeight: 600, padding: '20px 0' }}>Message sent!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} rows={4} placeholder={`Ask ${seller?.fullName || 'the seller'} about this listing…`} />
            <Button variant="accent" disabled={!messageText.trim()} loading={messageSending} onClick={handleSendMessage}>
              Send
            </Button>
          </div>
        )}
      </Modal>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report">
        {reportSent ? (
          <p style={{ textAlign: 'center', color: colors.text, fontWeight: 600, padding: '20px 0' }}>
            Thanks — our team will review this.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Select label="What are you reporting?" value={reportTarget} onChange={(e) => setReportTarget(e.target.value)}>
              <option value="product">This listing</option>
              <option value="user">This seller</option>
            </Select>
            <Textarea
              label="Reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              placeholder="Tell us what's wrong…"
            />
            <Button variant="danger" disabled={!reportReason.trim()} loading={reportSubmitting} onClick={handleSendReport}>
              Submit Report
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
