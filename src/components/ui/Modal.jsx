import { colors, radius, fontFamily } from './tokens'

export default function Modal({ open, onClose, title, children, maxWidth = 480 }) {
  if (!open) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(13,12,34,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.bg, borderRadius: radius.lg, width: '100%', maxWidth,
          maxHeight: '85vh', overflowY: 'auto', fontFamily,
          boxShadow: '0 24px 64px rgba(13,12,34,0.25)',
        }}
      >
        {title && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 20px', borderBottom: `1px solid ${colors.border}`,
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: colors.text, margin: 0 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary, fontSize: '20px', lineHeight: 1, padding: '4px' }}
            >
              ×
            </button>
          </div>
        )}
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  )
}
