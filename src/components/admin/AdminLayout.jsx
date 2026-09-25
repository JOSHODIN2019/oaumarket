import AdminSidebar from './AdminSidebar'
import { colors, fontFamily } from '../ui/tokens'

export default function AdminLayout({ children, maxWidth = '1100px', contentStyle = {} }) {
  return (
    <div style={{ minHeight: '100vh', background: colors.surface, fontFamily, display: 'flex' }}>
      <AdminSidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth, margin: '0 auto', padding: '32px 24px 80px', ...contentStyle }}>
          {children}
        </div>
      </div>
    </div>
  )
}
