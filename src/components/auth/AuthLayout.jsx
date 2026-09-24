import { motion } from 'framer-motion'
import CampusGate from './CampusGate'

export default function AuthLayout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>

      {/* Left panel — wider: 60% on desktop, full width on mobile/tablet */}
      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          height: '100%',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          flexShrink: 0,
          zIndex: 2,
        }}
        className="w-full lg:w-[60%]"
      >
        {children}
      </motion.section>

      {/* Right panel — narrower: 40% on desktop, hidden on mobile/tablet */}
      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        style={{
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hidden lg:block lg:w-[40%]"
      >
        <CampusGate />
      </motion.aside>
    </div>
  )
}
