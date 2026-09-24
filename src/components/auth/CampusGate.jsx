import { motion } from 'framer-motion'

// Real photo of OAU's main gate (public domain / CC0, via Wikimedia
// Commons) - replaces the old Solana-branded looping video background.
export default function CampusGate() {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#1a2a4a' }}>
      <img
        src="/images/oau-gate.jpg"
        alt="Obafemi Awolowo University main gate, Ile-Ife"
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover', objectPosition: '50% 30%' }}
      />

      {/* Dark gradient overlay - keeps the bottom text readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(10,10,20,0.15) 0%, rgba(10,10,20,0.05) 35%, rgba(15,12,8,0.65) 68%, rgba(10,8,5,0.94) 100%)',
        }}
      />

      {/* Bottom text content */}
      <div className="absolute bottom-0 left-0 right-0" style={{ padding: '48px 40px 44px' }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          style={{
            color: '#ffffff',
            fontFamily: "'Outfit', 'Instrument Sans', sans-serif",
            fontSize: '22px',
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '-0.3px',
            marginBottom: '10px',
          }}
        >
          Built for OAU students
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          style={{
            color: 'rgba(255,255,255,0.80)',
            fontSize: '14px',
            lineHeight: '1.7',
            marginBottom: '28px',
            maxWidth: '320px',
          }}
        >
          Buy and sell second-hand items with fellow students on
          campus - verified by matric number, every time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          style={{ display: 'flex', gap: '32px' }}
        >
          {[
            { label: 'Listing', value: 'Free' },
            { label: 'Login', value: 'Matric No.' },
            { label: 'Handoff', value: 'On campus' },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  color: '#f2c14e',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '16px',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginBottom: '4px',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.60)',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
