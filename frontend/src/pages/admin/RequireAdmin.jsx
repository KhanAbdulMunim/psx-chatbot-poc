import { Navigate } from 'react-router-dom'

export function isAdminAuthed() {
  return sessionStorage.getItem('psx_admin_authed') === 'true'
}

export default function RequireAdmin({ children }) {
  if (!isAdminAuthed()) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}
