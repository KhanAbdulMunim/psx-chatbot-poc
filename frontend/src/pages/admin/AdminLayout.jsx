import { NavLink, Outlet, useNavigate } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/documents', label: 'Documents' },
  { to: '/admin/approvals', label: 'Approval queue' },
  { to: '/admin/users', label: 'Users & roles' },
  { to: '/admin/analytics', label: 'Analytics' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  function logout() {
    sessionStorage.removeItem('psx_admin_authed')
    navigate('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--paper)' }}>
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--ink)',
          color: 'var(--paper)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
        }}
      >
        <div style={{ padding: '0 8px', marginBottom: 32 }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: '#8fa3bd', textTransform: 'uppercase' }}>
            PSX · POC
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginTop: 4 }}>
            Knowledge admin
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
                textDecoration: 'none',
                color: isActive ? 'var(--ink)' : '#c7d0dd',
                background: isActive ? 'var(--paper)' : 'transparent',
                transition: 'background 0.15s ease, color 0.15s ease',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={logout}
          style={{
            marginTop: 'auto',
            background: 'transparent',
            border: '1px solid #3a4a66',
            color: '#c7d0dd',
            borderRadius: 'var(--radius-sm)',
            padding: '9px 12px',
            fontSize: 13,
            transition: 'border-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#5c6f8f')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#3a4a66')}
        >
          Sign out
        </button>
      </aside>

      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1100 }}>
        <Outlet />
      </main>
    </div>
  )
}
