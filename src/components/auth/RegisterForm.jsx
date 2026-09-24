import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { registerUser, updateMyAvatar } from '../../lib/api'
import { saveSession } from '../../lib/session'
import { resizeImageToDataUrl } from '../../lib/resizeImage'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

const MATRIC_PATTERN = /^[A-Za-z]{2,10}\/\d{4}\/\d{2,5}$/

export default function RegisterForm() {
  const location = useLocation()
  const navigate = useNavigate()

  const [matricNumber, setMatricNumber] = useState(location.state?.matricNumber || '')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [avatarDataUrl, setAvatarDataUrl] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()

  const handleAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      setAvatarDataUrl(dataUrl)
      setAvatarPreview(dataUrl)
    } catch {
      setErrors((p) => ({ ...p, avatar: "Couldn't load that image - try a different file." }))
    }
  }

  const sanitizeUsername = (val) =>
    val.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 24)

  const validate = () => {
    const e = {}
    if (!matricNumber.trim()) e.matricNumber = 'Please enter your matric number'
    else if (!MATRIC_PATTERN.test(matricNumber.trim())) e.matricNumber = 'Format should be DEPT/YEAR/NUMBER, e.g. CSC/2019/093'
    if (!fullName.trim()) e.fullName = 'Please enter your full name'
    else if (fullName.trim().length < 2) e.fullName = 'Name must be at least 2 characters'
    if (!username.trim()) e.username = 'Please choose a username'
    else if (username.length < 3) e.username = 'Username must be at least 3 characters'
    if (!password) e.password = 'Please choose a password'
    else if (password.length < 8) e.password = 'Password must be at least 8 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    const result = await registerUser({ matricNumber: matricNumber.trim().toUpperCase(), fullName: fullName.trim(), username, password })
    if (result.status === 'network-error') {
      setLoading(false)
      setErrors({ form: "Couldn't reach the server - is the backend running?" })
      return
    }
    if (result.status === 'server-error') {
      setLoading(false)
      setErrors({ form: result.message })
      return
    }
    if (result.status !== 'success') {
      setLoading(false)
      setErrors({ form: 'Something went wrong. Please try again.' })
      return
    }

    saveSession(result.data)
    if (avatarDataUrl) {
      await updateMyAvatar(result.data.accessToken, avatarDataUrl)
    }
    setLoading(false)
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
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-8 left-10"
      >
        <LogoWordmark />
      </motion.div>

      <div className="flex flex-col w-full">

        {/* Heading */}
        <motion.h1
          variants={fadeUp} initial="hidden" animate="show" custom={0}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '26px', fontWeight: 700, color: '#0d0c22',
            letterSpacing: '-0.5px', marginBottom: '8px',
          }}
        >
          Complete your profile
        </motion.h1>

        <motion.p
          variants={fadeUp} initial="hidden" animate="show" custom={1}
          style={{ fontSize: '14px', color: '#6b6b82', lineHeight: '1.6', marginBottom: '32px' }}
        >
          You&apos;re almost in. Set up your OAUMarket identity.
        </motion.p>

        <motion.form
          variants={fadeUp} initial="hidden" animate="show" custom={2}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >

          {/* Avatar upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                width: '64px', height: '64px', borderRadius: '50%',
                border: '2px dashed #e8e8ed', background: avatarPreview ? 'transparent' : '#f8f8fb',
                cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#9945FF')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e8ed')}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <CameraIcon />
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#0d0c22', marginBottom: '2px' }}>
                Profile photo
              </p>
              <p style={{ fontSize: '12px', color: '#a0a0b0' }}>Optional — you can add one later</p>
            </div>
          </div>

          {/* Matric number */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#0d0c22', marginBottom: '4px' }}>
              Matric number
            </label>
            <input
              type="text"
              value={matricNumber}
              onChange={e => { setMatricNumber(e.target.value); setErrors(p => ({ ...p, matricNumber: '' })) }}
              placeholder="e.g. CSC/2019/093"
              style={inputStyle(!!errors.matricNumber)}
              onFocus={e => { e.target.style.borderColor = '#0d0c22'; e.target.style.boxShadow = '0 0 0 3px rgba(13,12,34,0.06)' }}
              onBlur={e => { e.target.style.borderColor = errors.matricNumber ? '#ef4444' : '#e8e8ed'; e.target.style.boxShadow = 'none' }}
            />
            <FieldError msg={errors.matricNumber} />
          </div>

          {/* Full name */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#0d0c22', marginBottom: '4px' }}>
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: '' })) }}
              placeholder="e.g. Adaeze Okonkwo"
              style={inputStyle(!!errors.fullName)}
              onFocus={e => { e.target.style.borderColor = '#0d0c22'; e.target.style.boxShadow = '0 0 0 3px rgba(13,12,34,0.06)' }}
              onBlur={e => { e.target.style.borderColor = errors.fullName ? '#ef4444' : '#e8e8ed'; e.target.style.boxShadow = 'none' }}
            />
            <FieldError msg={errors.fullName} />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#0d0c22', marginBottom: '4px' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '15px', color: '#a0a0b0', fontWeight: 500, pointerEvents: 'none',
              }}>@</span>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(sanitizeUsername(e.target.value)); setErrors(p => ({ ...p, username: '' })) }}
                placeholder="yourname"
                style={{ ...inputStyle(!!errors.username), paddingLeft: '32px' }}
                onFocus={e => { e.target.style.borderColor = '#0d0c22'; e.target.style.boxShadow = '0 0 0 3px rgba(13,12,34,0.06)' }}
                onBlur={e => { e.target.style.borderColor = errors.username ? '#ef4444' : '#e8e8ed'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <FieldError msg={errors.username} />
            {!errors.username && username.length >= 3 && (
              <span style={{ fontSize: '12px', color: '#14F195', paddingLeft: '4px' }}>✓ Looks good</span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#0d0c22', marginBottom: '4px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
              placeholder="At least 8 characters"
              style={inputStyle(!!errors.password)}
              onFocus={e => { e.target.style.borderColor = '#0d0c22'; e.target.style.boxShadow = '0 0 0 3px rgba(13,12,34,0.06)' }}
              onBlur={e => { e.target.style.borderColor = errors.password ? '#ef4444' : '#e8e8ed'; e.target.style.boxShadow = 'none' }}
            />
            <FieldError msg={errors.password} />
          </div>

          <FieldError msg={errors.form} />

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', fontSize: '15px', fontWeight: 600,
              fontFamily: 'inherit', color: '#ffffff',
              background: loading ? '#4a4a6a' : '#0d0c22',
              border: 'none', borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s', marginTop: '4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1a1a2e' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0d0c22' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </motion.button>

          <p style={{ fontSize: '12px', color: '#a0a0b0', textAlign: 'center', lineHeight: '1.6' }}>
            By continuing, you agree to our{' '}
            <a href="#" style={{ color: '#0d0c22', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Terms</a>
            {' '}and{' '}
            <a href="#" style={{ color: '#0d0c22', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Privacy Policy</a>.
          </p>
        </motion.form>
      </div>
    </div>
  )
}

function FieldError({ msg }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.span
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ fontSize: '12px', color: '#ef4444', paddingLeft: '4px' }}
        >
          {msg}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

function inputStyle(hasError) {
  return {
    width: '100%', padding: '13px 16px', fontSize: '15px',
    fontFamily: 'inherit', color: '#0d0c22', background: '#ffffff',
    border: hasError ? '1.5px solid #ef4444' : '1.5px solid #e8e8ed',
    borderRadius: '12px', outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a0a0b0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function LogoWordmark() {
  return (
    <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '21px', color: '#0d0c22', letterSpacing: '-0.3px', lineHeight: 1 }}>
      OAU<span style={{ color: '#9945FF' }}>Market</span>
    </span>
  )
}
