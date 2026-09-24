import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/home/TopNav'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Input, Textarea, Select } from '../components/ui/Input'
import { colors } from '../components/ui/tokens'
import { getSession } from '../lib/session'
import { fetchCategories, createProduct } from '../lib/api'
import { resizeImageToDataUrl } from '../lib/resizeImage'

const MAX_PHOTOS = 4

export default function SellItem() {
  const navigate = useNavigate()
  const session = getSession()
  const [categories, setCategories] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('Used')
  const [categoryId, setCategoryId] = useState('')
  const [location, setLocation] = useState('')
  const [imageUrls, setImageUrls] = useState([])
  const [imageError, setImageError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories().then((result) => {
      if (result.status === 'success') {
        setCategories(result.data)
        if (result.data.length > 0) setCategoryId(result.data[0].slug)
      }
    })
  }, [])

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const dataUrl = await resizeImageToDataUrl(file, 640)
      setImageUrls((prev) => (prev.length < MAX_PHOTOS ? [...prev, dataUrl] : prev))
      setImageError('')
    } catch {
      setImageError("Couldn't load that image - try a different file.")
    }
  }

  const removeImage = (index) => setImageUrls((prev) => prev.filter((_, i) => i !== index))

  const missingFields = [
    !title.trim() && 'Title',
    !description.trim() && 'Description',
    !(Number(price) > 0) && 'Price',
    !location.trim() && 'Location',
  ].filter(Boolean)
  const isValid = missingFields.length === 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError('')
    const result = await createProduct({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      condition,
      categoryId,
      location: location.trim(),
      sellerId: session.user.id,
      imageUrls,
    })
    setLoading(false)
    if (result.status === 'success') {
      navigate(`/product/${result.data._id}`)
    } else if (result.status === 'network-error') {
      setError("Couldn't reach the server.")
    } else {
      setError(result.message || 'Something went wrong.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <TopNav />
      <div style={{ maxWidth: '620px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, marginBottom: '4px' }}>Post a Listing</h1>
        <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '28px' }}>Sell it to a fellow student.</p>

        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: colors.text, display: 'block', marginBottom: '8px' }}>
                Photos ({imageUrls.length}/{MAX_PHOTOS})
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {imageUrls.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '11px', lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {imageUrls.length < MAX_PHOTOS && (
                  <label style={{ width: '72px', height: '72px', borderRadius: '10px', border: `2px dashed ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: colors.textMuted, fontSize: '22px' }}>
                    +
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
              {imageError && <span style={{ fontSize: '12px', color: colors.danger }}>{imageError}</span>}
            </div>

            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Casio Scientific Calculator" />
            <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Condition, why you're selling, anything a buyer should know" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input label="Price (₦)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="5000" />
              <Select label="Condition" value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="New">New</option>
                <option value="Used">Used</option>
              </Select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                ))}
              </Select>
              <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Hostel Block C" />
            </div>

            {error && <span style={{ fontSize: '13px', color: colors.danger }}>{error}</span>}

            <Button type="submit" variant="accent" size="lg" disabled={!isValid} loading={loading}>
              Publish Listing
            </Button>
            {!isValid && (
              <p style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center' }}>
                Missing: {missingFields.join(', ')}
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  )
}
