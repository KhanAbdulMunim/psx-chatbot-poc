export default function PageHeader({ eyebrow, title, description }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {eyebrow && (
        <div
          className="mono"
          style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 6 }}
        >
          {eyebrow}
        </div>
      )}
      <h1 style={{ fontSize: 26, marginBottom: description ? 6 : 0 }}>{title}</h1>
      {description && <p style={{ color: 'var(--slate)', fontSize: 14, maxWidth: 560 }}>{description}</p>}
    </div>
  )
}
