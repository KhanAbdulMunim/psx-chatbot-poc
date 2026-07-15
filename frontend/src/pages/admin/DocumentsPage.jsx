import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageHeader from '../../components/PageHeader.jsx'
import { api } from '../../api.js'

const TYPE_LABEL = { pdf: 'PDF', docx: 'DOCX', txt: 'TXT' }

const STATUS_STYLE = {
  processing: { bg: 'var(--amber-bg)', fg: 'var(--amber)', label: 'Processing' },
  ready: { bg: 'var(--verdigris-bg)', fg: 'var(--verdigris)', label: 'Ready' },
  failed: { bg: 'var(--danger-bg)', fg: 'var(--danger)', label: 'Failed' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.processing
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        padding: '3px 9px',
        borderRadius: 20,
        background: s.bg,
        color: s.fg,
        fontWeight: 500,
      }}
    >
      {status === 'processing' && (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            border: '1.5px solid currentColor',
            borderTopColor: 'transparent',
            display: 'inline-block',
          }}
        />
      )}
      {s.label}
    </span>
  )
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const pollRef = useRef(null)

  const refresh = useCallback(async () => {
    try {
      const docs = await api.listDocuments()
      setDocuments(docs)
      return docs
    } catch (e) {
      setUploadError(e.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    return () => clearInterval(pollRef.current)
  }, [refresh])

  useEffect(() => {
    const anyProcessing = documents.some((d) => d.status === 'processing')
    if (anyProcessing && !pollRef.current) {
      pollRef.current = setInterval(refresh, 2000)
    } else if (!anyProcessing && pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [documents, refresh])

  async function handleFiles(fileList) {
    setUploadError('')
    const files = Array.from(fileList)
    const allowed = ['pdf', 'docx', 'txt']
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (!allowed.includes(ext)) {
        setUploadError(`"${file.name}" isn't a supported type. Upload PDF, DOCX, or TXT.`)
        continue
      }
      setUploading(true)
      try {
        await api.uploadDocument(file)
      } catch (e) {
        setUploadError(e.message)
      }
    }
    setUploading(false)
    refresh()
  }

  async function handleDelete(id) {
    setDocuments((docs) => docs.filter((d) => d.id !== id))
    try {
      await api.deleteDocument(id)
    } catch (e) {
      setUploadError(e.message)
      refresh()
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Knowledge base"
        title="Documents"
        description="Upload source documents here. Once a document finishes processing, its content becomes answerable in the chat."
      />

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `1.5px dashed ${dragOver ? 'var(--verdigris)' : 'var(--paper-line)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '32px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'var(--verdigris-bg)' : 'var(--paper-raised)',
          transition: 'border-color 0.15s ease, background 0.15s ease',
          marginBottom: 16,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 4 }}>
          {uploading ? 'Uploading…' : 'Drop a document here, or click to browse'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--slate-soft)' }}>PDF, DOCX, or TXT</div>
      </div>

      {uploadError && (
        <div
          style={{
            color: 'var(--danger)',
            background: 'var(--danger-bg)',
            fontSize: 13,
            padding: '9px 12px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 16,
          }}
        >
          {uploadError}
        </div>
      )}

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
            gridTemplateColumns: '1fr 90px 110px 90px 130px 40px',
            padding: '10px 16px',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--slate-soft)',
            borderBottom: '1px solid var(--paper-line)',
          }}
        >
          <span>Filename</span>
          <span>Type</span>
          <span>Status</span>
          <span>Chunks</span>
          <span>Uploaded</span>
          <span />
        </div>

        {loading && (
          <div style={{ padding: 24, fontSize: 13, color: 'var(--slate)' }}>Loading…</div>
        )}

        {!loading && documents.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 4 }}>
              No documents yet
            </div>
            <div style={{ fontSize: 12, color: 'var(--slate-soft)' }}>
              Upload a document above to start building the knowledge base.
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 90px 110px 90px 130px 40px',
                padding: '12px 16px',
                fontSize: 13,
                alignItems: 'center',
                borderBottom: '1px solid var(--paper-line)',
              }}
              title={doc.status === 'failed' ? doc.error : undefined}
            >
              <span style={{ color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {doc.filename}
              </span>
              <span className="mono" style={{ color: 'var(--slate)', fontSize: 11 }}>
                {TYPE_LABEL[doc.file_type] || doc.file_type}
              </span>
              <StatusBadge status={doc.status} />
              <span style={{ color: 'var(--slate)' }}>{doc.chunk_count || '—'}</span>
              <span style={{ color: 'var(--slate-soft)', fontSize: 12 }}>
                {new Date(doc.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleDelete(doc.id)}
                aria-label={`Delete ${doc.filename}`}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--slate-soft)',
                  fontSize: 13,
                  padding: 4,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--slate-soft)')}
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
