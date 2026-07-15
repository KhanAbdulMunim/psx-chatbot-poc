import { motion } from 'framer-motion'
import PageHeader from '../../components/PageHeader.jsx'

const WEEKS = [32, 41, 38, 52, 61, 58, 70]

export default function AnalyticsPage() {
  const max = Math.max(...WEEKS)
  return (
    <div>
      <PageHeader
        eyebrow="Phase 2 concept"
        title="Analytics & reporting"
        description="Preview of usage trends and scheduled reporting. The Dashboard tab shows this POC's real numbers; this page illustrates the fuller reporting suite planned for production."
      />

      <div
        style={{
          background: 'var(--paper-raised)',
          border: '1px solid var(--paper-line)',
          borderRadius: 'var(--radius-md)',
          padding: 24,
        }}
      >
        <h3 style={{ fontSize: 15, marginBottom: 20 }}>Query volume — last 7 weeks</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 140 }}>
          {WEEKS.map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(v / max) * 100}px` }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
                style={{ width: '100%', background: 'var(--verdigris-bg)', borderRadius: '4px 4px 0 0', position: 'relative' }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'var(--verdigris)', opacity: 0.35, borderRadius: '4px 4px 0 0' }} />
              </motion.div>
              <span style={{ fontSize: 11, color: 'var(--slate-soft)' }}>W{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
