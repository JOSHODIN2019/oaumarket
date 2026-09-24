import { colors, radius, fontFamily } from './tokens'

const VARIANTS = {
  primary: { background: colors.solid, color: colors.onSolid, border: 'none' },
  accent: { background: colors.primary, color: '#fff', border: 'none' },
  secondary: { background: colors.bg, color: colors.text, border: `1.5px solid ${colors.border}` },
  ghost: { background: 'none', color: colors.textSecondary, border: 'none' },
  danger: { background: colors.danger, color: '#fff', border: 'none' },
}

const SIZES = {
  sm: { padding: '7px 14px', fontSize: '13px' },
  md: { padding: '11px 20px', fontSize: '14px' },
  lg: { padding: '14px 24px', fontSize: '15px' },
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  style = {},
  children,
  ...props
}) {
  const variantStyle = VARIANTS[variant]
  const sizeStyle = SIZES[size]
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      className={className}
      style={{
        ...variantStyle,
        ...sizeStyle,
        fontFamily,
        fontWeight: 600,
        borderRadius: radius.sm,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'opacity 0.15s, background 0.15s',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}
