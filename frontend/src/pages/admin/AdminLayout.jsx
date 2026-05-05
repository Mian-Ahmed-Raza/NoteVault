import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText,
  LogOut, Menu, X, Shield, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navLinks = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/notes', label: 'Notes', icon: FileText },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#07070f' }}>

      {/* ─── Sidebar ──────────────────────────────────────────── */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 transition-all duration-300
        ${sidebarOpen ? 'w-64' : 'w-16'}
      `}
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderRight: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">NoteVault</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Admin Panel</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            {sidebarOpen
              ? <X className="w-4 h-4 text-white" />
              : <Menu className="w-4 h-4 text-white" />
            }
          </button>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1 mt-2">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: isActive(path)
                  ? 'rgba(220, 38, 38, 0.15)'
                  : 'transparent',
                border: isActive(path)
                  ? '1px solid rgba(220,38,38,0.3)'
                  : '1px solid transparent',
                color: isActive(path) ? 'white' : 'rgba(255,255,255,0.5)'
              }}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive(path) ? 'text-red-400' : ''}`} />
              {sidebarOpen && (
                <span className="text-sm font-medium">{label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom: Back to App + Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: 'rgba(165,180,252,1)'
            }}
          >
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Back to App</span>}
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full"
            style={{ color: 'rgba(248,113,113,1)' }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ──────────────────────────────────────── */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(7,7,15,0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-white font-semibold text-sm">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm text-white/70">{user?.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded-md text-red-300"
              style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
              Admin
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;