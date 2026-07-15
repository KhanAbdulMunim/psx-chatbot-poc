import { motion } from 'framer-motion'
import PageHeader from '../../components/PageHeader.jsx'

const ROWS = [
  { doc: 'Circular 14/2026 — Margin requirements', author: 'A. Farooq', stage: 'In review', role: 'Reviewer' },
  { doc: 'Prospectus addendum — XYZ Holdings', author: 'S. Malik', stage: 'Reviewed', role: 'Approver' },
  { doc: 'Investor guide — Trading holidays 2026', author: 'H. Raza', stage: 'Draft', role: 'Author' },
]

const STAGE_COLOR = {
  Draft: 'var(--slate)',
  'In review': 'var(--amber)',
  Reviewed: 'var(--verdigris)',
}

export default function ApprovalsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Phase 2 concept"
        title="Approval queue"
        description="Preview of the four-role content workflow — Content Author, Reviewer, Approver, System Admin — planned for the production build. Not wired to live data in this POC."
      />

      <div
        style={{
          background: 'var(--paper-raised)',
          border: '1px solid var(--paper-line)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
            padding: '10px 16px',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--slate-soft)',
            borderBottom: '1px solid var(--paper-line)',
          }}
        >
          <span>Document</span>
          <span>Author</span>
          <span>Stage</span>
          <span>Waiting on</span>
        </div>
        {ROWS.map((row, i) => (
          <motion.div
            key={row.doc}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
              padding: '13px 16px',
              fontSize: 13,
              alignItems: 'center',
              borderBottom: '1px solid var(--paper-line)',
            }}
          >
            <span style={{ color: 'var(--ink)' }}>{row.doc}</span>
            <span style={{ color: 'var(--slate)' }}>{row.author}</span>
            <span style={{ color: STAGE_COLOR[row.stage], fontWeight: 500 }}>{row.stage}</span>
            <span style={{ color: 'var(--slate-soft)' }}>{row.role}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
