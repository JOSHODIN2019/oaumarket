import { colors, radius, fontFamily } from './tokens'

export function Input({ label, error, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>{label}</label>
      )}
      <input
        style={{
          width: '100%',
          padding: '11px 14px',
          fontSize: '14px',
          fontFamily,
          color: colors.text,
          background: colors.surface,
          border: `1.5px solid ${error ? colors.danger : colors.border}`,
          borderRadius: radius.sm,
          outline: 'none',
          transition: 'border-color 0.15s',
          ...style,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: colors.danger }}>{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>{label}</label>
      )}
      <textarea
        style={{
          width: '100%',
          padding: '11px 14px',
          fontSize: '14px',
          fontFamily,
          color: colors.text,
          background: colors.surface,
          border: `1.5px solid ${error ? colors.danger : colors.border}`,
          borderRadius: radius.sm,
          outline: 'none',
          resize: 'vertical',
          transition: 'border-color 0.15s',
          ...style,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '12px', color: colors.danger }}>{error}</span>}
    </div>
  )
}

export function Select({ label, error, children, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 600, color: colors.text }}>{label}</label>
      )}
      <select
        style={{
          width: '100%',
          padding: '11px 14px',
          fontSize: '14px',
          fontFamily,
          color: colors.text,
          background: colors.surface,
          border: `1.5px solid ${error ? colors.danger : colors.border}`,
          borderRadius: radius.sm,
          outline: 'none',
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: '12px', color: colors.danger }}>{error}</span>}
    </div>
  )
}
