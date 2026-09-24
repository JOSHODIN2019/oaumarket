import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Slide data ────────────────────────────────────────────── */
const SLIDES = [
  {
    id: 0,
    video: '/videos/listing1.mp4',
    badge: 'Best Seller',
    badgeAccent: '#14F195',
    name: 'New Listings',
    category: 'Home Appliances',
    seller: 'Chukwuemeka B.',
    verified: true,
    price: 'From ₦15,000',
  },
  {
    id: 1,
    video: '/videos/listing2.mp4',
    badge: 'Trending',
    badgeAccent: '#9945FF',
    name: 'Gameboy',
    category: 'Electronics',
    seller: 'Tunde F.',
    verified: true,
    price: '₦280,000',
  },
  {
    id: 2,
    video: '/videos/listing3.mp4',
    badge: 'New Listing',
    badgeAccent: '#f59e0b',
    name: 'Kahf',
    category: 'Fashion',
    seller: 'Biodun A.',
    verified: false,
    price: '₦385,000',
  },
  {
    id: 3,
    video: '/videos/listing4.mp4',
    badge: 'Top Rated',
    badgeAccent: '#14F195',
    name: 'Nike Sneaker',
    category: 'Fashion',
    seller: 'Emeka D.',
    verified: true,
    price: '₦35,500',
  },
]

const N = SLIDES.length
const AUTOPLAY_MS = 6000
const DRAG_THRESHOLD = 0.22
const SPRING = { type: 'spring', stiffness: 340, damping: 32, mass: 0.9 }

/* ─── Main component ────────────────────────────────────────── */
export default function HeroCarousel() {
  const [active, setActive]       = useState(0)
  const [isHovering, setHovering] = useState(false)
  const [isDragging, setDragging] = useState(false)
  const containerRef              = useRef(null)
  const videoRefs                 = useRef([])
  const timerRef                  = useRef(null)

  const goTo = useCallback((idx) => {
    setActive(((idx % N) + N) % N)
  }, [])

  const prev = useCallback(() => goTo(active - 1), [active, goTo])
  const next = useCallback(() => goTo(active + 1), [active, goTo])

  /* ── Play / pause per active slide ── */
  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return
      if (i === active) {
        vid.play().catch(() => {})
        /* restart Ken Burns zoom */
        vid.style.animation = 'none'
        void vid.offsetWidth  /* reflow to reset animation */
        vid.style.animation = 'heroZoom 9s ease-out forwards'
      } else {
        vid.pause()
        vid.style.animation = 'none'
        vid.style.transform = 'scale(1.0)'
      }
    })
  }, [active])

  /* ── Auto-rotation ── */
  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current)
    if (!isHovering && !isDragging) {
      timerRef.current = setInterval(next, AUTOPLAY_MS)
    }
  }, [isHovering, isDragging, next])

  useEffect(() => {
    resetTimer()
    return () => clearInterval(timerRef.current)
  }, [resetTimer])

  /* ── Tab visibility ── */
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        clearInterval(timerRef.current)
        videoRefs.current[active]?.pause()
      } else {
        videoRefs.current[active]?.play().catch(() => {})
        resetTimer()
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [active, resetTimer])

  /* ── Next-3 thumbnails (wrapping) ── */
  const thumbIndices = [1, 2, 3].map(o => (active + o) % N)

  /* ─────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        borderRadius: '26px',
        overflow: 'hidden',
        aspectRatio: '16/10',
        background: '#0d0c22',
        boxShadow: '0 32px 72px rgba(0,0,0,0.26), 0 8px 20px rgba(0,0,0,0.14)',
        userSelect: 'none',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false) }}
    >
      {/* ── Ken Burns keyframe ── */}
      <style>{`
        @keyframes heroZoom {
          from { transform: scale(1.09); }
          to   { transform: scale(1.02); }
        }
      `}</style>

      {/* ── Video layers (all rendered, only active visible) ── */}
      {SLIDES.map((slide, i) => {
        const dist = Math.min(Math.abs(i - active), N - Math.abs(i - active))
        return (
          <motion.div
            key={slide.id}
            animate={{ opacity: i === active ? 1 : 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
          >
            <video
              ref={el => { videoRefs.current[i] = el }}
              src={slide.video}
              muted
              loop
              playsInline
              preload={dist <= 1 ? 'auto' : 'metadata'}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                transformOrigin: 'center center',
              }}
            />
          </motion.div>
        )
      })}

      {/* ── Gradient overlay ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.5) 58%, rgba(0,0,0,0.82) 100%)',
      }} />

      {/* ── Drag capture layer (sits between videos/gradient and UI) ── */}
      <motion.div
        style={{ position: 'absolute', inset: 0, zIndex: 9, cursor: isDragging ? 'grabbing' : 'grab' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.14}
        dragMomentum={false}
        onDragStart={() => { setDragging(true); clearInterval(timerRef.current) }}
        onDragEnd={(_, info) => {
          setDragging(false)
          const w = containerRef.current?.offsetWidth || 420
          if (info.offset.x < -(w * DRAG_THRESHOLD))      next()
          else if (info.offset.x > (w * DRAG_THRESHOLD))  prev()
          resetTimer()
        }}
      />

      {/* ── Badge — top left ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active + '-badge'}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, delay: 0.12 }}
          style={{
            position: 'absolute', top: '18px', left: '20px', zIndex: 14,
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(0,0,0,0.44)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.14)',
            padding: '5px 12px', borderRadius: '100px',
            fontSize: '10px', fontWeight: 700, color: '#ffffff',
            letterSpacing: '0.7px', textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: SLIDES[active].badgeAccent,
            boxShadow: `0 0 8px 2px ${SLIDES[active].badgeAccent}90`,
          }} />
          {SLIDES[active].badge}
        </motion.div>
      </AnimatePresence>

      {/* ── Bottom content row ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 14,
        padding: '16px 20px 22px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '10px',
      }}>

        {/* Product info — bottom left */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active + '-info'}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={SPRING}
          >
            <p style={{
              fontSize: '9px', color: 'rgba(255,255,255,0.48)',
              textTransform: 'uppercase', letterSpacing: '0.8px',
              fontWeight: 600, marginBottom: '5px',
              fontFamily: "'Instrument Sans', sans-serif",
            }}>
              {SLIDES[active].category}
            </p>

            <h3 style={{
              fontSize: '17px', fontWeight: 700, color: '#ffffff',
              fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
              letterSpacing: '-0.3px', lineHeight: 1.2,
              marginBottom: '5px', maxWidth: '200px',
            }}>
              {SLIDES[active].name}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '9px' }}>
              <span style={{
                fontSize: '11.5px', color: 'rgba(255,255,255,0.58)',
                fontFamily: "'Instrument Sans', sans-serif",
              }}>
                By {SLIDES[active].seller}
              </span>
              {SLIDES[active].verified && <VerifiedIcon />}
            </div>

            <div>
              <span style={{
                fontSize: '21px', fontWeight: 800, color: '#14F195',
                fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
                letterSpacing: '-0.5px',
              }}>
                {SLIDES[active].price}
              </span>
              {SLIDES[active].verified && (
                <p style={{
                  fontSize: '9.5px', color: 'rgba(255,255,255,0.38)',
                  marginTop: '3px', fontFamily: "'Instrument Sans', sans-serif",
                }}>
                  ✓ Verified Student Seller
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Thumbnails — bottom right (3 stacked) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
          {thumbIndices.map((slideIdx, j) => (
            <motion.button
              key={slideIdx}
              onClick={() => goTo(slideIdx)}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...SPRING, delay: j * 0.05 }}
              whileHover={{ scale: 1.1, borderColor: 'rgba(255,255,255,0.6)' }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: '46px', height: '46px', borderRadius: '10px',
                overflow: 'hidden', padding: 0, flexShrink: 0,
                border: '1.5px solid rgba(255,255,255,0.22)',
                boxShadow: '0 3px 12px rgba(0,0,0,0.55)',
                cursor: 'pointer', background: '#1a1a2e',
                zIndex: 15,
              }}
            >
              <video
                src={SLIDES[slideIdx].video}
                muted playsInline
                preload="metadata"
                onLoadedMetadata={e => { e.target.currentTime = 0.5 }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Navigation buttons (visible on hover only) ── */}
      <NavBtn side="left"  onClick={() => { prev(); resetTimer() }} zIndex={15} visible={isHovering} />
      <NavBtn side="right" onClick={() => { next(); resetTimer() }} zIndex={15} visible={isHovering} />

      {/* ── Progress dots ── */}
      <div style={{
        position: 'absolute', top: '18px', right: '20px', zIndex: 14,
        display: 'flex', flexDirection: 'column', gap: '4px', pointerEvents: 'none',
      }}>
        {SLIDES.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: i === active ? '18px' : '4px',
              opacity: i === active ? 1 : 0.35,
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ width: '3px', borderRadius: '2px', background: '#ffffff' }}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Nav button ─────────────────────────────────────────────── */
function NavBtn({ side, onClick, zIndex, visible }) {
  return (
    <motion.button
      onClick={onClick}
      animate={{ opacity: visible ? 0.72 : 0 }}
      whileHover={{ opacity: 1, background: 'rgba(20,20,20,0.78)' }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        [side]: '14px',
        top: 'calc(50% - 20px)',
        zIndex,
        pointerEvents: visible ? 'auto' : 'none',
        width: '40px', height: '40px', borderRadius: '50%',
        background: 'rgba(10,10,10,0.55)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#ffffff', padding: 0,
      }}
    >
      {side === 'left'
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      }
    </motion.button>
  )
}

/* ─── Verified icon ─────────────────────────────────────────── */
function VerifiedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        stroke="#14F195" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}
