import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../components/home/TopNav'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { colors } from '../components/ui/tokens'
import { getSession } from '../lib/session'
import { fetchProductsBySeller, updateProduct, deleteProduct } from '../lib/api'

export default function MyListings() {
  const session = getSession()
  const myId = session?.user?.id
  const [products, setProducts] = useState(undefined)
  const [pending, setPending] = useState(null)

  const load = () => {
    fetchProductsBySeller(myId).then((result) => {
      if (result.status === 'success') setProducts(result.data)
    })
  }

  useEffect(() => {
    if (myId) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId])

  const toggleAvailable = async (product) => {
    setPending(product._id)
    const result = await updateProduct(product._id, { actorId: myId, available: !product.available })
    if (result.status === 'success') {
      setProducts((current) => current.map((p) => (p._id === product._id ? result.data : p)))
    }
    setPending(null)
  }

  const handleDelete = async (product) => {
    setPending(product._id)
    const result = await deleteProduct(product._id, myId)
    if (result.status === 'success' || result.status === 'not-found') {
      setProducts((current) => current.filter((p) => p._id !== product._id))
    }
    setPending(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <TopNav />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, marginBottom: '4px' }}>My Listings</h1>
        <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '28px' }}>Everything you've listed for sale.</p>

        {products === undefined && <p style={{ color: colors.textSecondary, fontSize: '14px' }}>Loading…</p>}

        {products?.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '48px 20px' }}>
            <p style={{ fontWeight: 600, color: colors.text }}>No listings yet</p>
            <Link to="/sell"><Button variant="accent" style={{ marginTop: '12px' }}>List an Item</Button></Link>
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
                <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '2px 0 0' }}>₦{product.price.toLocaleString()}</p>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', textTransform: 'uppercase',
                background: product.available ? '#f0fdf4' : colors.surfaceHover, color: product.available ? '#15803d' : colors.textMuted,
              }}>
                {product.available ? 'Available' : 'Sold'}
              </span>
              <Button variant="secondary" size="sm" loading={pending === product._id} onClick={() => toggleAvailable(product)}>
                {product.available ? 'Mark Sold' : 'Relist'}
              </Button>
              <Button variant="ghost" size="sm" loading={pending === product._id} onClick={() => handleDelete(product)}>
                Delete
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
