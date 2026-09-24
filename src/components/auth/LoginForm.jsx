import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { loginUser } from '../../lib/api'
import { saveSession } from '../../lib/session'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

const MATRIC_PATTERN = /^[A-Za-z]{2,10}\/\d{4}\/\d{2,5}$/

export default function LoginForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const prefillMatric = location.state?.matricNumber || ''

  const [matricNumber, setMatricNumber] = useState(prefillMatric)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!matricNumber.trim()) e.matricNumber = 'Please enter your matric number'
    else if (!MATRIC_PATTERN.test(matricNumber.trim())) e.matricNumber = 'Format should be DEPT/YEAR/NUMBER, e.g. CSC/2019/093'
    if (!password) e.password = 'Please enter your password'
    else if (password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setErrors({})
    setLoading(true)

    const result = await loginUser({ matricNumber: matricNumber.trim().toUpperCase(), password })
    setLoading(false)

    if (result.status === 'network-error') {
      setErrors({ form: "Couldn't reach the server - is the backend running?" })
      return
    }
    if (result.status === 'server-error') {
      setErrors({ form: result.message })
      return
    }
    if (result.status !== 'success') {
      setErrors({ form: 'Incorrect email or password.' })
      return
    }

    saveSession(result.data)
    navigate('/home')
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        maxWidth: 420,
        width: '100%',
        margin: '0 auto',
        justifyContent: 'center',
        padding: '2rem clamp(1.5rem, 5vw, 2.5rem)',
        position: 'relative',
      }}
    >
      {/* Logo wordmark */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-8 left-10"
      >
        <LogoWordmark />
      </motion.div>

      {/* Form content */}
      <div className="flex flex-col w-full">

        {/* Heading */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          style={{
            fontFamily: "'Outfit', 'Instrument Sans', sans-serif",
            fontSize: '26px',
            fontWeight: 700,
            color: '#0d0c22',
            letterSpacing: '-0.5px',
            marginBottom: '8px',
          }}
        >
          Welcome back
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          style={{
            fontSize: '14px',
            color: '#6b6b82',
            lineHeight: '1.6',
            marginBottom: '32px',
          }}
        >
          Sign in to continue to your account.
        </motion.p>

        {/* Form */}
        <motion.form
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          {/* Matric number */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#0d0c22', marginBottom: '4px' }}>
              Matric number
            </label>
            <input
              type="text"
              value={matricNumber}
              onChange={(e) => { setMatricNumber(e.target.value); setErrors(p => ({ ...p, matricNumber: '' })) }}
              placeholder="e.g. CSC/2019/093"
              style={{
                width: '100%',
                padding: '13px 16px',
                fontSize: '15px',
                fontFamily: 'inherit',
                color: '#0d0c22',
                background: '#ffffff',
                border: errors.matricNumber ? '1.5px solid #ef4444' : '1.5px solid #e8e8ed',
                borderRadius: '12px',
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0d0c22'
                e.target.style.boxShadow = '0 0 0 3px rgba(13,12,34,0.06)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.matricNumber ? '#ef4444' : '#e8e8ed'
                e.target.style.boxShadow = 'none'
              }}
            />
            <AnimatePresence>
              {errors.matricNumber && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: '12px', color: '#ef4444', paddingLeft: '4px' }}
                >
                  {errors.matricNumber}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#0d0c22' }}>
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{ fontSize: '13px', color: '#9945FF', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '13px 48px 13px 16px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  color: '#0d0c22',
                  background: '#ffffff',
                  border: errors.password ? '1.5px solid #ef4444' : '1.5px solid #e8e8ed',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0d0c22'
                  e.target.style.boxShadow = '0 0 0 3px rgba(13,12,34,0.06)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.password ? '#ef4444' : '#e8e8ed'
                  e.target.style.boxShadow = 'none'
                }}
              />
              {/* Show/hide toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  color: '#a0a0b0', display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: '12px', color: '#ef4444', paddingLeft: '4px' }}
                >
                  {errors.password}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {errors.form && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ fontSize: '13px', color: '#ef4444', textAlign: 'center' }}
              >
                {errors.form}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Sign in button */}
          <motion.button
            type="submit"
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading}
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
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1a1a2e' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#0d0c22' }}
          >
            {loading && <Spinner />}
            {loading ? 'Signing in…' : 'Sign in'}
          </motion.button>

          {/* Sign up link */}
          <p style={{ fontSize: '13px', color: '#6b6b82', textAlign: 'center', marginTop: '4px' }}>
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              style={{ color: '#0d0c22', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
            >
              Sign up
            </Link>
          </p>
        </motion.form>
      </div>
    </div>
  )
}

function LogoWordmark() {
  return (
    <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '21px', color: '#0d0c22', letterSpacing: '-0.3px', lineHeight: 1 }}>
      OAU<span style={{ color: '#9945FF' }}>Market</span>
    </span>
  )
}

function EyeOn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <motion.path
        d="M12 2a10 10 0 0 1 10 10"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        style={{ originX: '12px', originY: '12px' }}
      />
    </svg>
  )
}
