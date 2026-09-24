import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { colors, radius, fontFamily } from '../../components/ui/tokens'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { adminLogin } from '../../lib/api'
import { saveAdminSession } from '../../lib/session'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await adminLogin({ email: email.trim().toLowerCase(), password })
    setLoading(false)

    if (result.status === 'network-error') {
      setError("Couldn't reach the server - is the backend running?")
      return
    }
    if (result.status !== 'success') {
      setError('Incorrect email or password.')
      return
    }
    saveAdminSession(result.data)
    navigate('/admin')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0d0c22', fontFamily,
    }}>
      <Card style={{ width: '380px', background: '#16152e', border: '1px solid #2a2a44' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
          OAU<span style={{ color: colors.primary }}>Market</span> Admin
        </h1>
        <p style={{ fontSize: '13px', color: '#8888a0', marginBottom: '24px' }}>Sign in to the admin console.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '4px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '11px 14px', fontSize: '14px', fontFamily,
                color: '#fff', background: '#0d0c22', border: '1.5px solid #2a2a44',
                borderRadius: radius.sm, outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '11px 14px', fontSize: '14px', fontFamily,
                color: '#fff', background: '#0d0c22', border: '1.5px solid #2a2a44',
                borderRadius: radius.sm, outline: 'none',
              }}
            />
          </div>
          {error && <p style={{ fontSize: '13px', color: colors.danger, margin: 0 }}>{error}</p>}
          <Button type="submit" variant="accent" loading={loading} style={{ marginTop: '4px' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
