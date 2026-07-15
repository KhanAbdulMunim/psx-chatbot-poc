import { Navigate, Route, Routes } from 'react-router-dom'
import ChatPage from './pages/ChatPage.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import DocumentsPage from './pages/admin/DocumentsPage.jsx'
import ApprovalsPage from './pages/admin/ApprovalsPage.jsx'
import UsersPage from './pages/admin/UsersPage.jsx'
import AnalyticsPage from './pages/admin/AnalyticsPage.jsx'
import RequireAdmin from './pages/admin/RequireAdmin.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
