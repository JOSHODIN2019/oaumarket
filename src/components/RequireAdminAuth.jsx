import { Navigate } from 'react-router-dom'
import { getAdminSession } from '../lib/session'

export default function RequireAdminAuth({ children }) {
  const session = getAdminSession()
  if (!session?.accessToken) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}
