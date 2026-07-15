import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function Citation({ citation }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="mono"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 4,
          border: '1px solid var(--amber)',
          background: open ? 'var(--amber)' : 'var(--amber-bg)',
          color: open ? 'var(--paper-raised)' : 'var(--amber)',
          marginRight: 6,
          marginTop: 8,
          transition: 'background 0.15s ease, color 0.15s ease',
        }}
      >
        [{citation.index}] {citation.filename.length > 22 ? citation.filename.slice(0, 20) + '…' : citation.filename}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ overflow: 'hidden', width: '100%' }}
          >
            <div
              style={{
                borderTop: '1.5px dashed var(--paper-line)',
                marginTop: 10,
                paddingTop: 10,
                marginBottom: 4,
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--slate-soft)',
                  marginBottom: 4,
                }}
              >
                {citation.filename}
                {citation.heading ? ` — ${citation.heading}` : ''}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.55, fontStyle: 'italic' }}>
                "{citation.snippet}{citation.snippet.length >= 280 ? '…' : ''}"
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
