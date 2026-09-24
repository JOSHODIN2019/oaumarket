import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/home/TopNav'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { colors } from '../components/ui/tokens'
import { getSession, saveSession } from '../lib/session'
import { updateMyProfile } from '../lib/api'
import { resizeImageToDataUrl } from '../lib/resizeImage'

export default function EditProfile() {
  const navigate = useNavigate()
  const session = getSession()

  const [fullName, setFullName] = useState(session?.user?.fullName || '')
  const [avatarPreview, setAvatarPreview] = useState(session?.user?.avatarUrl || null)
  const [avatarDataUrl, setAvatarDataUrl] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  const handleAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const dataUrl = await resizeImageToDataUrl(file)
      setAvatarDataUrl(dataUrl)
      setAvatarPreview(dataUrl)
      setSaved(false)
    } catch {
      setError("Couldn't load that image - try a different file.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please enter your full name.')
      return
    }
    setError('')
    setSaving(true)

    const payload = { fullName: fullName.trim() }
    if (avatarDataUrl) payload.avatarUrl = avatarDataUrl

    const result = await updateMyProfile(session.accessToken, payload)
    setSaving(false)

    if (result.status === 'network-error') {
      setError("Couldn't reach the server - is the backend running?")
      return
    }
    if (result.status !== 'success') {
      setError(result.message || 'Something went wrong. Please try again.')
      return
    }

    saveSession({ ...session, user: { ...session.user, fullName: result.data.fullName, avatarUrl: result.data.avatarUrl } })
    setAvatarDataUrl(null)
    setSaved(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <TopNav />
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: colors.text, marginBottom: '4px' }}>Edit Profile</h1>
        <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '28px' }}>Update your name and profile photo.</p>

        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Avatar upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  border: `2px dashed ${colors.border}`, background: avatarPreview ? 'transparent' : colors.surface,
                  cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.15s', padding: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.primary)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #9945FF, #14F195)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '24px' }}>
                    {(fullName || session?.user?.username || '?').charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: colors.text, marginBottom: '2px' }}>Profile photo</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{ background: 'none', border: 'none', color: colors.primary, fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Change photo
                </button>
              </div>
            </div>

            <Input
              label="Full name"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setSaved(false) }}
              placeholder="e.g. Adaeze Nwosu"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>Matric number</label>
              <p style={{ fontSize: '13px', color: colors.textMuted, margin: 0 }}>{session?.user?.matricNumber} (cannot be changed)</p>
            </div>

            {error && <span style={{ fontSize: '13px', color: colors.danger }}>{error}</span>}
            {saved && <span style={{ fontSize: '13px', color: '#15803d' }}>✓ Profile updated</span>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="submit" variant="accent" loading={saving} style={{ flex: 1 }}>
                Save Changes
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/home')} style={{ flex: 1 }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
