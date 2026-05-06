import React, { createContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useToast } from './hooks/useToast'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import VerificationBanner from './components/VerificationBanner'

// Pages
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import AllNotes from './pages/AllNotes'
import UploadPage from './pages/UploadPage'
import MyUploads from './pages/MyUploads'
import SearchPage from './pages/SearchPage'
import VerifyRequired from './pages/VerifyRequired'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminNotes from './pages/admin/AdminNotes'

export const ToastContext = createContext(null)

// ─── Page Loader ───────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0f'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 48, height: 48,
        border: '4px solid rgba(99,102,241,0.2)',
        borderTopColor: '#6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }} />
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
        Loading...
      </p>
    </div>
  </div>
)

// ─── Layout With Navbar ────────────────────────────────────────────
const AppLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f' }}>
    <Navbar />
    <main style={{ paddingTop: 64 }}>
      {children}
    </main>
  </div>
)

// ─── Public Route ──────────────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

// ─── Protected Route (Must be logged in) ──────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return children
}

// ─── Verified Route (Must be logged in + email verified) ──────────
const VerifiedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (!user?.isVerified) return <VerifyRequired />
  return children
}

// ─── Admin Route ───────────────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (isAuthenticated && !user) return <PageLoader />
  if (isAuthenticated && user && !user.isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

// ─── Main App ──────────────────────────────────────────────────────
const App = () => {
  const { toasts, toast, removeToast } = useToast()

  return (
    <ToastContext.Provider value={toast}>
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f' }}>
        <Routes>

          {/* ── Public Routes ─────────────────────────────────── */}
          <Route path="/auth" element={
            <PublicRoute><AuthPage /></PublicRoute>
          } />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ── Admin Routes ──────────────────────────────────── */}
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute><AdminUsers /></AdminRoute>
          } />
          <Route path="/admin/notes" element={
            <AdminRoute><AdminNotes /></AdminRoute>
          } />

          {/* ── Verified Routes (Need email verification) ─────── */}
          <Route path="/dashboard" element={
            <VerifiedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </VerifiedRoute>
          } />
          <Route path="/notes" element={
            <VerifiedRoute>
              <AppLayout><AllNotes /></AppLayout>
            </VerifiedRoute>
          } />
          <Route path="/upload" element={
            <VerifiedRoute>
              <AppLayout><UploadPage /></AppLayout>
            </VerifiedRoute>
          } />
          <Route path="/my-uploads" element={
            <VerifiedRoute>
              <AppLayout><MyUploads /></AppLayout>
            </VerifiedRoute>
          } />
          <Route path="/search" element={
            <VerifiedRoute>
              <AppLayout><SearchPage /></AppLayout>
            </VerifiedRoute>
          } />

          {/* ── Redirects ─────────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />

        </Routes>

        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </ToastContext.Provider>
  )
}

export default App