import { Navigate } from 'react-router-dom'
import { getSession } from '../lib/session'

export default function RequireAuth({ children }) {
  const session = getSession()
  if (!session?.accessToken) {
    return <Navigate to="/" replace />
  }
  return children
}
