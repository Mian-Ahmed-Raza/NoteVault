import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useToast } from './hooks/useToast';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminNotes from './pages/admin/AdminNotes'


// ─── Lazy Load Pages ───────────────────────────────────────────────
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AllNotes = React.lazy(() => import('./pages/AllNotes'));
const UploadPage = React.lazy(() => import('./pages/UploadPage'));
const MyUploads = React.lazy(() => import('./pages/MyUploads'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));

// ─── Loading Fallback ──────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-accent-500/20 border-b-accent-500 animate-spin animate-reverse" />
      </div>
      <p className="text-white/60 text-sm font-medium">Loading NoteVault...</p>
    </div>
  </div>
);

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (!user?.isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

// ─── Protected Route ───────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
};

// ─── Public Route (redirect if logged in) ─────────────────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

// ─── Toast Context ─────────────────────────────────────────────────
export const ToastContext = React.createContext(null);

const App = () => {
  const { toasts, toast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={toast}>
      <div className="min-h-screen bg-dark-950">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1 pt-16">
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/notes" element={<AllNotes />} />
                        <Route path="/upload" element={<UploadPage />} />
                        <Route path="/my-uploads" element={<MyUploads />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                        <Route path="/admin/notes" element={<AdminRoute><AdminNotes /></AdminRoute>} />
                      </Routes>
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>

        {/* Toast Notifications */}
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </ToastContext.Provider>
  );
};

export default App;