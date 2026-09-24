import { useState } from 'react'

const STORAGE_KEY = 'sm_theme'

export default function ThemeToggle({ style = {} }) {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light')

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem(STORAGE_KEY, next)
    setTheme(next)
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: '36px', height: '36px', borderRadius: '8px',
        border: '1.5px solid var(--sm-border)', background: 'var(--sm-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: '15px', flexShrink: 0,
        ...style,
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
