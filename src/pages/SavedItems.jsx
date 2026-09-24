import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../components/home/TopNav'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { colors } from '../components/ui/tokens'
import { getSession } from '../lib/session'
import { fetchFavorites, removeFavorite, fetchProductById } from '../lib/api'

export default function SavedItems() {
  const session = getSession()
  const myId = session?.user?.id
  const [products, setProducts] = useState(undefined)

  useEffect(() => {
    if (!myId) return
    fetchFavorites(myId).then(async (result) => {
      if (result.status !== 'success') {
        setProducts([])
        return
      }
      const results = await Promise.all(result.data.map((id) => fetchProductById(id)))
      setProducts(results.filter((r) => r.status === 'success').map((r) => r.data))
    })
  }, [myId])

  const handleRemove = (productId) => {
    removeFavorite(myId, productId)
    setProducts((current) => current.filter((p) => p._id !== productId))
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <TopNav />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, marginBottom: '4px' }}>Saved Items</h1>
        <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '28px' }}>Listings you've saved to come back to later.</p>

        {products === undefined && <p style={{ color: colors.textSecondary, fontSize: '14px' }}>Loading…</p>}
        {products?.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '48px 20px' }}>
            <p style={{ fontWeight: 600, color: colors.text }}>Nothing saved yet</p>
            <Link to="/home"><Button variant="accent" style={{ marginTop: '12px' }}>Browse Marketplace</Button></Link>
          </Card>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products?.map((product) => (
            <Card key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: colors.surfaceHover }}>
                {product.imageUrls?.[0] && <img src={product.imageUrls[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/product/${product._id}`} style={{ fontSize: '14px', fontWeight: 600, color: colors.text, textDecoration: 'none' }}>{product.title}</Link>
                <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '2px 0 0' }}>
                  {product.available ? `₦${product.price.toLocaleString()}` : 'No longer available'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleRemove(product._id)}>Remove</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
