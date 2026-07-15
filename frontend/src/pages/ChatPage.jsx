import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import Citation from '../components/Citation.jsx'

const GREETING = {
  role: 'assistant',
  answer:
    "I'm a proof-of-concept assistant. I answer strictly from documents uploaded to this knowledge base — ask me something, or upload a document from the admin portal first.",
  citations: [],
  wasAnswered: true,
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '4px 2px' }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--slate-soft)' }}
        />
      ))}
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 18,
      }}
    >
      {isUser ? (
        <div
          style={{
            maxWidth: '72%',
            background: 'var(--ink)',
            color: 'var(--paper)',
            padding: '10px 15px',
            borderRadius: '14px 14px 3px 14px',
            fontSize: 14.5,
          }}
        >
          {msg.question}
        </div>
      ) : (
        <div
          style={{
            maxWidth: '78%',
            background: msg.wasAnswered === false ? 'var(--paper)' : 'var(--paper-raised)',
            border: `1px solid ${msg.wasAnswered === false ? 'var(--paper-line)' : 'var(--paper-line)'}`,
            borderLeft: msg.wasAnswered === false ? '3px solid var(--slate-soft)' : '3px solid var(--verdigris)',
            borderRadius: '3px 14px 14px 14px',
            padding: '13px 16px',
            fontSize: 14.5,
            lineHeight: 1.65,
            color: msg.wasAnswered === false ? 'var(--slate)' : 'var(--ink)',
            fontStyle: msg.wasAnswered === false ? 'italic' : 'normal',
          }}
        >
          <div>{msg.answer}</div>
          {msg.citations && msg.citations.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 2 }}>
              {msg.citations.map((c) => (
                <Citation key={c.index} citation={c} />
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend(e) {
    e.preventDefault()
    const question = input.trim()
    if (!question || loading) return

    setMessages((m) => [...m, { role: 'user', question }])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const res = await api.chat(question)
      setMessages((m) => [
        ...m,
        { role: 'assistant', answer: res.answer, citations: res.citations, wasAnswered: res.was_answered },
      ])
    } catch (err) {
      setError(err.message || 'Something went wrong reaching the assistant.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxWidth: 720,
        margin: '0 auto',
        background: 'var(--paper)',
      }}
    >
      <header
        style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--paper-line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div
            className="mono"
            style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--verdigris)', textTransform: 'uppercase', marginBottom: 4 }}
          >
            PSX knowledge assistant · Proof of concept
          </div>
          <h1 style={{ fontSize: 20 }}>Ask a question about the uploaded documents</h1>
        </div>
        <Link
          to="/admin/login"
          className="mono"
          style={{ fontSize: 11, color: 'var(--slate-soft)', textDecoration: 'none', whiteSpace: 'nowrap', marginTop: 4 }}
        >
          Admin →
        </Link>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
        </AnimatePresence>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 18 }}>
            <div
              style={{
                background: 'var(--paper-raised)',
                border: '1px solid var(--paper-line)',
                borderLeft: '3px solid var(--verdigris)',
                borderRadius: '3px 14px 14px 14px',
                padding: '13px 18px',
              }}
            >
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div style={{ padding: '0 24px 8px', color: 'var(--danger)', fontSize: 13 }}>{error}</div>
      )}

      <form
        onSubmit={handleSend}
        style={{
          display: 'flex',
          gap: 10,
          padding: '16px 24px 24px',
          borderTop: '1px solid var(--paper-line)',
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the knowledge base…"
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 24,
            border: '1px solid var(--paper-line)',
            background: 'var(--paper-raised)',
            fontSize: 14.5,
            fontFamily: 'var(--font-body)',
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '0 22px',
            borderRadius: 24,
            border: 'none',
            background: 'var(--ink)',
            color: 'var(--paper)',
            fontSize: 14,
            fontWeight: 500,
            opacity: loading || !input.trim() ? 0.5 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}
