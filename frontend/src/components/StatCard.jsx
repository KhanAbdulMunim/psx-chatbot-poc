import { motion } from 'framer-motion'

export default function StatCard({ label, value, sublabel, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      style={{
        background: 'var(--paper-raised)',
        border: '1px solid var(--paper-line)',
        borderRadius: 'var(--radius-md)',
        padding: '18px 20px',
        flex: 1,
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: 'var(--ink)' }}>{value}</div>
      {sublabel && <div style={{ fontSize: 12, color: 'var(--slate-soft)', marginTop: 4 }}>{sublabel}</div>}
    </motion.div>
  )
}
