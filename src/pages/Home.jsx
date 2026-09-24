import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import TopNav from '../components/home/TopNav'
import HeroCarousel from '../components/home/HeroCarousel'
import { colors } from '../components/ui/tokens'
import { getSession } from '../lib/session'
import { fetchProducts, fetchCategories, fetchFavorites, saveFavorite, removeFavorite, fetchPublicUser } from '../lib/api'

const CONTENT_TABS = [
  { label: 'Products', icon: <GridIcon /> },
  { label: 'Sellers', icon: <UsersIcon /> },
  { label: 'Services', icon: <TagIcon /> },
]

const HERO_TABS = ['Buy', 'Sell']

const HERO_CONTENT = {
  Buy: {
    heading: <>Find what you need,<br />built for <span style={{ color: '#9945FF' }}>students</span></>,
    bullets: [
      'Browse items, food & services from fellow students',
      'Message the seller directly to arrange a safe handoff',
      'Make an offer, or buy at the listed price',
    ],
    cta: 'Browse Listings',
  },
  Sell: {
    heading: <>Sell what<br />you don't <span style={{ color: '#9945FF' }}>need</span></>,
    bullets: [
      'List items, food or services in under 2 minutes',
      'Chat with buyers and accept the offer that works for you',
      "Mark it sold once you've handed it over",
    ],
    cta: 'Post a Listing',
  },
}

/* ─── Page ─────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate()
  const session = getSession()
  const [searchParams] = useSearchParams()
  const [heroTab, setHeroTab] = useState('Buy')
  const [contentTab, setContentTab] = useState('Products')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [hoveredId, setHoveredId] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [sellerNames, setSellerNames] = useState({})
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  const firstName = session?.user?.fullName?.split(' ')[0] || session?.user?.username || null
  const hero = HERO_CONTENT[heroTab]

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchProducts(), fetchCategories()]).then(([productsResult, categoriesResult]) => {
      if (productsResult.status === 'success') setProducts(productsResult.data)
      if (categoriesResult.status === 'success') setCategories(categoriesResult.data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!session?.user?.id) return
    fetchFavorites(session.user.id).then((result) => {
      if (result.status === 'success') setFavoriteIds(new Set(result.data))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  // Resolve seller names once per unique sellerId - a real Product
  // only stores `sellerId`, never a display name, so this is the one
  // extra round trip that makes a listing's card human-readable.
  useEffect(() => {
    const idsToResolve = [...new Set(products.map((p) => p.sellerId))].filter((id) => !(id in sellerNames))
    if (idsToResolve.length === 0) return
    Promise.all(idsToResolve.map((id) => fetchPublicUser(id))).then((results) => {
      setSellerNames((current) => {
        const next = { ...current }
        results.forEach((result, index) => {
          next[idsToResolve[index]] = result.status === 'success' && result.data ? result.data.fullName : 'Unknown seller'
        })
        return next
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products])

  const toggleFavorite = (productId) => {
    if (!session?.user?.id) return
    const alreadySaved = favoriteIds.has(productId)
    setFavoriteIds((current) => {
      const next = new Set(current)
      if (alreadySaved) next.delete(productId)
      else next.add(productId)
      return next
    })
    if (alreadySaved) removeFavorite(session.user.id, productId)
    else saveFavorite(session.user.id, productId)
  }

  const filtered = useMemo(() => {
    if (contentTab !== 'Products') return []
    return products.filter((p) => {
      const matchCategory = !activeCategory || p.categoryId === activeCategory
      const matchSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [contentTab, search, activeCategory, products])

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif", color: colors.text }}>
      <TopNav />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${colors.border}`, padding: '72px 0 64px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px', display: 'flex', alignItems: 'center', gap: '48px', flexWrap: 'wrap' }}>

          {/* Left */}
          <div style={{ flex: 1 }}>
            {firstName && (
              <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '8px' }}>Welcome back, {firstName} 👋</p>
            )}
            {/* Segmented toggle */}
            <div style={{ marginBottom: '28px' }}>
              <SegmentedToggle value={heroTab} onChange={setHeroTab} options={HERO_TABS} />
            </div>

            {/* Heading */}
            <motion.h1
              key={heroTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
                fontSize: '56px', fontWeight: 700,
                color: colors.text, lineHeight: 1.1, letterSpacing: '-1.68px',
                marginBottom: '22px',
              }}
            >
              {hero.heading}
            </motion.h1>

            {/* Bullets */}
            <motion.ul
              key={heroTab + 'b'}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              style={{ listStyle: 'none', marginBottom: '30px' }}
            >
              {hero.bullets.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px', fontSize: '14px', color: colors.textSecondary, lineHeight: '1.55' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginTop: '1px', flexShrink: 0 }}>
                    <path d="M20 6L9 17l-5-5" stroke="#9945FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </motion.ul>

            {/* CTA */}
            <button
              onClick={() => {
                if (heroTab === 'Sell') navigate('/sell')
                else document.getElementById('listings-grid')?.scrollIntoView({ behavior: 'smooth' })
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '10px',
                background: colors.solid, color: colors.onSolid, border: 'none',
                fontSize: '14px', fontWeight: 600, fontFamily: 'inherit',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = colors.solidHover}
              onMouseLeave={e => e.currentTarget.style.background = colors.solid}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              {hero.cta}
            </button>
          </div>

          {/* Right — Hero Carousel */}
          <div style={{ flex: '0 0 52%', minWidth: '360px', maxWidth: '620px', margin: '0' }}>
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* ── Content area ──────────────────────────────────── */}
      <div id="listings-grid" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px 80px' }}>

        {/* Content tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}`, marginBottom: '24px' }}>
          {CONTENT_TABS.map(tab => {
            const isActive = contentTab === tab.label
            return (
              <button
                key={tab.label}
                onClick={() => setContentTab(tab.label)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '16px 20px', background: 'none', border: 'none',
                  borderBottom: `2px solid ${isActive ? colors.text : 'transparent'}`,
                  marginBottom: '-1px',
                  fontSize: '14px', fontWeight: isActive ? 600 : 400,
                  color: isActive ? colors.text : colors.textSecondary,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Full-width search bar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          background: colors.surfaceHover, borderRadius: '100px',
          padding: '0 8px 0 22px', height: '52px', marginBottom: '18px',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9b9b9b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="What are you looking for?"
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontSize: '15px', fontFamily: 'inherit', color: colors.text, padding: '0 14px',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, fontSize: '18px', padding: '0 8px', lineHeight: 1 }}>✕</button>
          )}
        </div>

        {/* Category row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <span style={{ fontSize: '13px', color: colors.textSecondary, fontWeight: 500, flexShrink: 0 }}>Categories:</span>
          {categories.map(category => {
            const isActive = activeCategory === category.slug
            return (
              <button
                key={category._id}
                onClick={() => setActiveCategory(isActive ? null : category.slug)}
                style={{
                  padding: '4px 14px', borderRadius: '20px', border: 'none',
                  background: isActive ? colors.solid : colors.surfaceHover,
                  color: isActive ? colors.onSolid : colors.textSecondary,
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit',
                  fontWeight: isActive ? 600 : 400, transition: 'all 0.15s',
                }}
              >
                {category.name}
              </button>
            )
          })}
        </div>

        {/* Grid or empty / coming-soon / loading */}
        {contentTab !== 'Products' ? (
          <ComingSoon tab={contentTab} />
        ) : loading ? (
          <p style={{ textAlign: 'center', padding: '80px 0', color: colors.textSecondary, fontSize: '14px' }}>Loading listings…</p>
        ) : filtered.length === 0 ? (
          <EmptyState onReset={() => { setSearch(''); setActiveCategory(null) }} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '28px 24px',
          }}>
            {filtered.map((product, i) => (
              <ProductCard
                key={product._id}
                product={product}
                sellerName={sellerNames[product.sellerId]}
                index={i}
                hovered={hoveredId === product._id}
                onHover={() => setHoveredId(product._id)}
                onLeave={() => setHoveredId(null)}
                onClick={() => navigate(`/product/${product._id}`)}
                isFavorited={favoriteIds.has(product._id)}
                onToggleFavorite={(e) => { e.stopPropagation(); toggleFavorite(product._id) }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${colors.border}`, padding: '28px 48px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '18px', color: colors.text }}>
            OAU<span style={{ color: '#9945FF' }}>Market</span>
          </span>
        </div>
      </footer>
    </div>
  )
}

/* ─── Segmented Toggle ─────────────────────────────────────── */
function SegmentedToggle({ value, onChange, options }) {
  const activeIndex = options.indexOf(value)
  return (
    <div style={{
      position: 'relative', display: 'inline-flex',
      background: colors.surfaceHover, borderRadius: '100px', padding: '3px',
    }}>
      <motion.div
        animate={{ x: activeIndex === 0 ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 420, damping: 22, mass: 0.85 }}
        style={{
          position: 'absolute', top: '3px', left: '3px',
          width: `calc(${100 / options.length}% - 3px)`,
          height: 'calc(100% - 6px)',
          background: colors.bg, borderRadius: '100px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.14), 0 0 0 0.5px rgba(0,0,0,0.06)',
          pointerEvents: 'none',
        }}
      />
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            position: 'relative', zIndex: 1,
            padding: '6px 16px', border: 'none', background: 'transparent',
            borderRadius: '100px', cursor: 'pointer',
            fontSize: '12px', fontWeight: value === opt ? 700 : 400,
            letterSpacing: '0.5px', textTransform: 'uppercase',
            color: value === opt ? colors.text : colors.textSecondary,
            fontFamily: 'inherit', userSelect: 'none',
            transition: 'color 0.2s',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

/* ─── Product Card ──────────────────────────────────────────── */
function ProductCard({ product, sellerName, index, hovered, onHover, onLeave, onClick, isFavorited, onToggleFavorite }) {
  const coverImage = product.imageUrls?.[0]
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div style={{
        borderRadius: '12px', overflow: 'hidden',
        position: 'relative', background: colors.surfaceHover,
        aspectRatio: '4/3',
        marginBottom: '10px',
      }}>
        {coverImage ? (
          <img src={coverImage} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #9945FF33, #14F19533)' }} />
        )}

        <button
          onClick={onToggleFavorite}
          aria-label={isFavorited ? 'Remove from saved' : 'Save item'}
          style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'rgba(13,12,34,0.55)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={isFavorited ? '#ef4444' : 'none'} stroke={isFavorited ? '#ef4444' : '#ffffff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {!product.available && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,12,34,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '5px 14px', borderRadius: '6px', textTransform: 'uppercase' }}>Sold</span>
          </div>
        )}

        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(13,12,34,0.42)',
          opacity: hovered ? 1 : 0, transition: 'opacity 0.18s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#ffffff', color: '#0d0c22',
            padding: '9px 20px', borderRadius: '8px',
            fontSize: '13px', fontWeight: 600, fontFamily: "'Outfit', sans-serif",
          }}>
            View Listing
          </div>
        </div>
      </div>

      <p style={{
        fontSize: '13px', fontWeight: 600, color: colors.text,
        lineHeight: 1.35, marginBottom: '6px',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {product.title}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <div style={{
          width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #9945FF, #14F195)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '9px', fontWeight: 700, color: '#fff',
        }}>
          {(sellerName || '?').charAt(0)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '12px', color: colors.textSecondary, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '110px' }}>
            {sellerName || 'Loading…'}
          </span>
        </div>

        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#9945FF', flexShrink: 0 }}>
          ₦{product.price >= 1000 ? (product.price / 1000).toFixed(0) + 'k' : product.price.toLocaleString()}
        </span>

        <span style={{ fontSize: '11px', color: colors.textMuted, display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          {product.viewCount}
        </span>
      </div>
    </motion.div>
  )
}

/* ─── Empty / Coming Soon ───────────────────────────────────── */
function EmptyState({ onReset }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: '56px', marginBottom: '18px' }}>🔍</div>
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, marginBottom: '8px' }}>No listings found</h3>
      <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '20px' }}>Try a different search or category</p>
      <button onClick={onReset} style={{ padding: '10px 22px', borderRadius: '8px', background: colors.solid, color: colors.onSolid, border: 'none', fontSize: '14px', fontWeight: 600, fontFamily: "'Outfit', sans-serif", cursor: 'pointer' }}>
        Clear filters
      </button>
    </motion.div>
  )
}

function ComingSoon({ tab }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ textAlign: 'center', padding: '80px 0', color: colors.textSecondary }}>
      <div style={{ fontSize: '56px', marginBottom: '18px' }}>{tab === 'Sellers' ? '👤' : '⚡'}</div>
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, marginBottom: '8px' }}>{tab} coming soon</h3>
      <p style={{ fontSize: '14px' }}>We're building this section. Check back shortly.</p>
    </motion.div>
  )
}

/* ─── Tab icons ─────────────────────────────────────────────── */
function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
}
function UsersIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
}
function TagIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
}
