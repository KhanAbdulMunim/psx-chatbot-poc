import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../../api.js'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.adminLogin(password)
      sessionStorage.setItem('psx_admin_authed', 'true')
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Incorrect password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--ink)',
        padding: 24,
      }}
    >
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 360,
          background: 'var(--paper-raised)',
          borderRadius: 'var(--radius-lg)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div
          className="mono"
          style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--slate)', textTransform: 'uppercase' }}
        >
          Admin portal
        </div>
        <h1 style={{ fontSize: 22, marginTop: 6, marginBottom: 24 }}>Sign in to continue</h1>

        <label style={{ fontSize: 13, color: 'var(--slate)', display: 'block', marginBottom: 6 }}>
          Password
        </label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--paper-line)',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            marginBottom: 16,
          }}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              fontSize: 13,
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 16,
            }}
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '11px',
            background: 'var(--ink)',
            color: 'var(--paper-raised)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            fontWeight: 500,
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div style={{ marginTop: 18, fontSize: 12, color: 'var(--slate-soft)', textAlign: 'center' }}>
          Proof-of-concept build — single shared credential
        </div>
      </motion.form>
    </div>
  )
}
