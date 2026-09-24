import { colors, radius } from './tokens'

export default function Card({ children, style = {}, ...props }) {
  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.md,
        padding: '20px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
