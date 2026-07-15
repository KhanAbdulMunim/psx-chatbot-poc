import { motion } from 'framer-motion'
import PageHeader from '../../components/PageHeader.jsx'

const USERS = [
  { name: 'Amir Farooq', role: 'Content Author', dept: 'Regulatory Affairs' },
  { name: 'Sana Malik', role: 'Reviewer', dept: 'Legal & Compliance' },
  { name: 'Hassan Raza', role: 'Approver', dept: 'Listing & Corporate Affairs' },
  { name: 'You', role: 'System Admin', dept: 'IT / ISO' },
]

const ROLE_BG = {
  'Content Author': 'var(--verdigris-bg)',
  Reviewer: 'var(--amber-bg)',
  Approver: 'var(--verdigris-bg)',
  'System Admin': 'var(--ink)',
}
const ROLE_FG = {
  'Content Author': 'var(--verdigris)',
  Reviewer: 'var(--amber)',
  Approver: 'var(--verdigris)',
  'System Admin': 'var(--paper)',
}

export default function UsersPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Phase 2 concept"
        title="Users & roles"
        description="Preview of role-based access control. Production build will connect to PSX's identity provider; this POC uses a single shared admin password."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {USERS.map((u, i) => (
          <motion.div
            key={u.name}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: 'var(--paper-raised)',
              border: '1px solid var(--paper-line)',
              borderRadius: 'var(--radius-md)',
              padding: '13px 16px',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'var(--paper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                color: 'var(--ink)',
                flexShrink: 0,
              }}
            >
              {u.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: 'var(--ink)' }}>{u.name}</div>
              <div style={{ fontSize: 12, color: 'var(--slate-soft)' }}>{u.dept}</div>
            </div>
            <span
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 20,
                background: ROLE_BG[u.role],
                color: ROLE_FG[u.role],
                fontWeight: 500,
              }}
            >
              {u.role}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
