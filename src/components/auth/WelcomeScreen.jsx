import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { checkMatric } from '../../lib/api'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

const MATRIC_PATTERN = /^[A-Za-z]{2,10}\/\d{4}\/\d{2,5}$/

export default function WelcomeScreen() {
  const [matricNumber, setMatricNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('signup') // 'signup' | 'signin'
  const navigate = useNavigate()

  const handleContinue = async (e) => {
    e.preventDefault()
    if (!matricNumber.trim()) {
      setError('Please enter your matric number')
      return
    }
    if (!MATRIC_PATTERN.test(matricNumber.trim())) {
      setError('Format should be DEPT/YEAR/NUMBER, e.g. CSC/2019/093')
      return
    }
    setError('')
    setLoading(true)
    const result = await checkMatric(matricNumber.trim().toUpperCase())
    setLoading(false)

    if (result.status === 'network-error') {
      setError("Couldn't reach the server - is the backend running?")
      return
    }
    if (result.status !== 'success') {
      setError('Something went wrong. Please try again.')
      return
    }

    if (result.data.exists) {
      navigate('/login', { state: { matricNumber } })
    } else {
      navigate('/register', { state: { matricNumber } })
    }
  }

  return (
    <div
      className="flex flex-col h-full py-8"
      style={{
        maxWidth: 420,
        width: '100%',
        margin: '0 auto',
        justifyContent: 'center',
        padding: '2rem clamp(1.5rem, 5vw, 2.5rem)',
      }}
    >

      {/* Logo wordmark — top */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-8 left-10"
      >
        <LogoWordmark />
      </motion.div>

      {/* Center content */}
      <div className="flex flex-col items-center w-full">

        {/* App icon */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          style={{ marginBottom: '24px' }}
        >
          <AppIcon />
        </motion.div>

        {/* Heading */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={mode + '-heading'}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -10 }}
            custom={1}
            style={{
              fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontSize: '26px',
              fontWeight: 700,
              color: '#0d0c22',
              letterSpacing: '-0.5px',
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            {mode === 'signup' ? 'Built for OAU students' : 'Welcome back'}
          </motion.h1>
        </AnimatePresence>

        {/* Subtitle */}
        <AnimatePresence mode="wait">
          {mode === 'signup' && (
            <motion.p
              key="subtitle"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              custom={2}
              style={{
                fontSize: '14px',
                color: '#6b6b82',
                textAlign: 'center',
                lineHeight: '1.6',
                marginBottom: '28px',
                maxWidth: '300px',
              }}
            >
              Buy and sell second-hand items with fellow students on campus - verified by matric number, every time.
            </motion.p>
          )}
          {mode === 'signin' && (
            <motion.p
              key="subtitle-signin"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              custom={2}
              style={{
                fontSize: '14px',
                color: '#6b6b82',
                textAlign: 'center',
                lineHeight: '1.6',
                marginBottom: '28px',
                maxWidth: '300px',
              }}
            >
              Sign in to continue to your account.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.form
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          onSubmit={handleContinue}
          className="w-full flex flex-col gap-3"
          noValidate
        >
          {/* Matric number input */}
          <div className="flex flex-col gap-1">
            <input
              type="text"
              value={matricNumber}
              onChange={(e) => { setMatricNumber(e.target.value); setError('') }}
              placeholder="Matric number, e.g. CSC/2019/093"
              aria-label="Matric number"
              style={{
                width: '100%',
                padding: '13px 16px',
                fontSize: '15px',
                fontFamily: 'inherit',
                color: '#0d0c22',
                background: '#ffffff',
                border: error ? '1.5px solid #ef4444' : '1.5px solid #e8e8ed',
                borderRadius: '12px',
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0d0c22'
                e.target.style.boxShadow = '0 0 0 3px rgba(13,12,34,0.06)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = error ? '#ef4444' : '#e8e8ed'
                e.target.style.boxShadow = 'none'
              }}
            />
            <AnimatePresence>
              {error && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ fontSize: '12px', color: '#ef4444', paddingLeft: '4px' }}
                >
                  {error}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* CTA Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: 'inherit',
              color: '#ffffff',
              background: loading ? '#4a4a6a' : '#0d0c22',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              letterSpacing: '-0.1px',
            }}
            onMouseEnter={(e) => { if (!loading) e.target.style.background = '#1a1a2e' }}
            onMouseLeave={(e) => { if (!loading) e.target.style.background = '#0d0c22' }}
          >
            {loading ? 'Checking…' : 'Continue'}
          </motion.button>

          {/* Terms */}
          <p style={{ fontSize: '12px', color: '#a0a0b0', textAlign: 'center', lineHeight: '1.6', marginTop: '4px' }}>
            By continuing, you agree to our{' '}
            <a href="#" style={{ color: '#0d0c22', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Terms</a>
            {' '}and{' '}
            <a href="#" style={{ color: '#0d0c22', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Privacy Policy</a>.
          </p>

          {/* Toggle sign in / sign up */}
          <p style={{ fontSize: '13px', color: '#6b6b82', textAlign: 'center', marginTop: '4px' }}>
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); setMatricNumber('') }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0d0c22',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px',
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    fontFamily: 'inherit',
                  }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); setMatricNumber('') }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0d0c22',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px',
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    fontFamily: 'inherit',
                  }}
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </motion.form>
      </div>
    </div>
  )
}

function AppIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="OAUMarket logo"
    >
      <defs>
        <clipPath id="sm-ball-clip">
          <circle cx="32" cy="32" r="30" />
        </clipPath>
      </defs>

      {/* Volleyball seam lines clipped to circle */}
      <g clipPath="url(#sm-ball-clip)" stroke="#ea4c89" strokeWidth="4" strokeLinecap="round" fill="none">
        {/* Left arc seam */}
        <path d="M 32,2 C 6,10 6,54 32,62" />
        {/* Right arc seam */}
        <path d="M 32,2 C 58,10 58,54 32,62" />
        {/* Horizontal S-curve seam */}
        <path d="M 2,32 C 18,8 46,56 62,32" />
      </g>

      {/* Ball outline */}
      <circle cx="32" cy="32" r="30" stroke="#ea4c89" strokeWidth="4" />
    </svg>
  )
}

function LogoWordmark() {
  return (
    <span
      style={{
        fontFamily: "'Outfit', 'Instrument Sans', sans-serif",
        fontWeight: 700,
        fontSize: '21px',
        color: '#0d0c22',
        letterSpacing: '-0.3px',
        lineHeight: 1,
      }}
    >
      OAU<span style={{ color: '#9945FF' }}>Market</span>
    </span>
  )
}
