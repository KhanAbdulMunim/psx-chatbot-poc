import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../../components/PageHeader.jsx'
import StatCard from '../../components/StatCard.jsx'
import { api } from '../../api.js'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.stats().then(setStats).catch((e) => setError(e.message))
  }, [])

  const unansweredRate =
    stats && stats.questions_total > 0
      ? Math.round((stats.questions_unanswered / stats.questions_total) * 100)
      : 0

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Live counts from the knowledge base and chat activity. Everything on this page reflects real data."
      />

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>
          Couldn't reach the API: {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
        <StatCard label="Documents ready" value={stats ? stats.documents_ready : '—'} delay={0} />
        <StatCard label="Chunks indexed" value={stats ? stats.chunk_count : '—'} delay={0.05} />
        <StatCard label="Questions asked" value={stats ? stats.questions_total : '—'} delay={0.1} />
        <StatCard
          label="Unanswered rate"
          value={stats ? `${unansweredRate}%` : '—'}
          sublabel="Outside current knowledge base"
          delay={0.15}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'var(--paper-raised)',
            border: '1px solid var(--paper-line)',
            borderRadius: 'var(--radius-md)',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15 }}>Content categories</h3>
            <span className="mono" style={{ fontSize: 10, color: 'var(--slate-soft)', textTransform: 'uppercase' }}>
              Illustrative
            </span>
          </div>
          {[
            ['Rulebook & regulations', 62],
            ['Prospectuses', 21],
            ['Investor education', 17],
          ].map(([label, pct]) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{label}</span>
                <span style={{ color: 'var(--slate)' }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--paper)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'var(--verdigris)' }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{
            background: 'var(--paper-raised)',
            border: '1px solid var(--paper-line)',
            borderRadius: 'var(--radius-md)',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15 }}>Awaiting your action</h3>
            <span className="mono" style={{ fontSize: 10, color: 'var(--slate-soft)', textTransform: 'uppercase' }}>
              Illustrative
            </span>
          </div>
          {['Circular 14/2026 — pending review', 'Prospectus addendum — pending approval'].map((label) => (
            <div
              key={label}
              style={{
                fontSize: 13,
                padding: '9px 0',
                borderBottom: '1px solid var(--paper-line)',
                color: 'var(--ink-soft)',
              }}
            >
              {label}
            </div>
          ))}
          <div style={{ fontSize: 12, color: 'var(--slate-soft)', marginTop: 10 }}>
            Full approval workflow is scoped for the next phase.
          </div>
        </motion.div>
      </div>
    </div>
  )
}
