// Shared design values pulled straight from the existing auth screens
// (RegisterForm/LoginForm/TopNav) rather than invented fresh - every
// new page below reuses these instead of re-declaring the same
// literal colors/radii inline everywhere.
// Neutral values track the current theme via CSS custom properties
// (defined in index.css, flipped by ThemeContext setting
// document.documentElement[data-theme]) - brand/semantic accents stay
// fixed across both themes.
export const colors = {
  text: 'var(--sm-text)',
  textSecondary: 'var(--sm-text-secondary)',
  textMuted: 'var(--sm-text-muted)',
  border: 'var(--sm-border)',
  borderStrong: 'var(--sm-border-strong)',
  bg: 'var(--sm-bg)',
  surface: 'var(--sm-surface)',
  surfaceHover: 'var(--sm-surface-hover)',
  primary: '#9945FF',
  primaryHover: '#7a2de6',
  success: '#14F195',
  danger: '#ef4444',
  warning: '#f59e0b',
  // Fixed (non-theme-reactive) - the solid "primary" button and dark
  // surfaces like TopNav/AdminNav are deliberately dark in both
  // themes, so they need a color that doesn't flip with `text`.
  solid: '#0d0c22',
  solidHover: '#1a1a2e',
  onSolid: '#ffffff',
}

export const fontFamily = "'Instrument Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const radius = { sm: 8, md: 12, lg: 16 }
