import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import TopNav from '../components/home/TopNav'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { colors } from '../components/ui/tokens'
import { fetchPublicUser, fetchProductsBySeller } from '../lib/api'

export default function SellerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [seller, setSeller] = useState(undefined)
  const [products, setProducts] = useState(undefined)

  useEffect(() => {
    fetchPublicUser(id).then((result) => setSeller(result.status === 'success' ? result.data : null))
    fetchProductsBySeller(id).then((result) => setProducts(result.status === 'success' ? result.data : []))
  }, [id])

  if (seller === null) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg }}>
        <TopNav />
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <h1 style={{ color: colors.text }}>Student not found</h1>
          <Button variant="secondary" onClick={() => navigate('/home')} style={{ marginTop: '16px' }}>Back to Marketplace</Button>
        </div>
      </div>
    )
  }

  const available = products?.filter((p) => p.available) || []

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <TopNav />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>
        {seller === undefined ? (
          <p style={{ color: colors.textSecondary, fontSize: '14px' }}>Loading…</p>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              {seller.avatarUrl ? (
                <img src={seller.avatarUrl} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #9945FF, #14F195)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '24px' }}>
                  {seller.fullName.charAt(0)}
                </div>
              )}
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 700, color: colors.text, margin: 0 }}>{seller.fullName}</h1>
                <p style={{ fontSize: '13px', color: colors.textMuted, margin: '2px 0 0' }}>@{seller.username}</p>
              </div>
            </div>

            <h2 style={{ fontSize: '15px', fontWeight: 700, color: colors.text, marginBottom: '14px' }}>
              Listings ({available.length})
            </h2>

            {products?.length === 0 && <p style={{ fontSize: '14px', color: colors.textMuted }}>No listings yet.</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {available.map((product) => (
                <Link key={product._id} to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
                  <Card style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: colors.surfaceHover }}>
                      {product.imageUrls?.[0] && <img src={product.imageUrls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: colors.text, margin: 0 }}>{product.title}</p>
                      <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '2px 0 0' }}>₦{product.price.toLocaleString()}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
