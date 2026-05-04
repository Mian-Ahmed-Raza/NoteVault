import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen, Upload, Home, Search, FileText,
  LogOut, Menu, X, ChevronDown,
  Bell, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/notes', label: 'Browse Notes', icon: BookOpen },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/my-uploads', label: 'My Uploads', icon: FileText },
  ];

  const isActive = (path) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
    setDropdownOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16">
      {/* Background with glassmorphism */}
      <div className="absolute inset-0 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5" />

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

        {/* ─── Logo ─────────────────────────────────────────────── */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 group"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">
            <span className="gradient-text">Note</span>
            <span className="text-white">Vault</span>
          </span>
        </Link>

        {/* ─── Desktop Navigation ───────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 relative group
                ${isActive(path)
                  ? 'text-white bg-primary-500/15 border border-primary-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive(path) ? 'text-primary-400' : ''}`} />
              {label}
              {isActive(path) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400" />
              )}
            </Link>
          ))}
        </nav>

        {/* ─── Right Side ───────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 
                         border border-white/10 hover:border-white/20 hover:bg-white/8
                         transition-all duration-200 group"
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 
                              flex items-center justify-center text-white text-xs font-bold shadow-glow-sm">
                {getUserInitials()}
              </div>
              <span className="hidden sm:block text-sm font-medium text-white/90 max-w-[100px] truncate">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-white/50 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-card border border-white/10 
                              overflow-hidden animate-slide-down shadow-xl">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-white/40 truncate">{user?.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="badge badge-primary">
                      {user?.rollNumber}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-1.5">
                  <Link
                    to="/my-uploads"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70
                               hover:text-white hover:bg-white/5 transition-all duration-150"
                  >
                    <FileText className="w-4 h-4" />
                    My Uploads
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm 
                               text-red-400 hover:text-red-300 hover:bg-red-500/10 
                               transition-all duration-150"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 
                       hover:bg-white/10 transition-all duration-200"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ─── Mobile Menu ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl 
                        border-b border-white/5 animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isActive(path)
                    ? 'bg-primary-500/15 text-white border border-primary-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive(path) ? 'text-primary-400' : ''}`} />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm 
                         font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;