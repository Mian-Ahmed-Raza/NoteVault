import React, { createContext, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
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
        width: 48,
        height: 48,
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

// ─── Layout with Navbar ────────────────────────────────────────────
const AppLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f' }}>
    <Navbar />
    <main style={{ paddingTop: 64 }}>
      {children}
    </main>
    <VerificationBanner />
  </div>
)

// ─── Protected Route ───────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return children
}

// ─── Public Route ──────────────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

// ─── Admin Route ───────────────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()

  // Show loader while auth is initializing
  if (loading) return <PageLoader />

  // Not logged in → go to auth
  if (!isAuthenticated) return <Navigate to="/auth" replace />

  // Logged in but not admin → go to dashboard
  if (isAuthenticated && user && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  // Still loading user data
  if (isAuthenticated && !user) return <PageLoader />

  // ✅ Is admin → show admin page
  return children
}

// ─── Main App ──────────────────────────────────────────────────────
const App = () => {
  const { toasts, toast, removeToast } = useToast()

  return (
    <ToastContext.Provider value={toast}>
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f' }}>
        <Routes>

          {/* ── Auth ──────────────────────────────────────────── */}
          <Route path="/auth" element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ── Admin Routes ──────────────────────────────────── */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
          <Route path="/admin/notes" element={
            <AdminRoute>
              <AdminNotes />
            </AdminRoute>
          } />

          {/* ── App Routes ────────────────────────────────────── */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/notes" element={
            <ProtectedRoute>
              <AppLayout>
                <AllNotes />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/upload" element={
            <ProtectedRoute>
              <AppLayout>
                <UploadPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/my-uploads" element={
            <ProtectedRoute>
              <AppLayout>
                <MyUploads />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/search" element={
            <ProtectedRoute>
              <AppLayout>
                <SearchPage />
              </AppLayout>
            </ProtectedRoute>
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