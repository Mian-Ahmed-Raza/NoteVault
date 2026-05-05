import React, { useState, useEffect, useContext } from 'react';
import {
  Users, Search, Ban, Trash2,
  Shield, RefreshCw, UserX, UserCheck,
  ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import { ToastContext } from '../../App';
import AdminLayout from './AdminLayout';

const AdminUsers = () => {
  const toast = useContext(ToastContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { page, limit: 10, search, filter }
      });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(1), 300);
    return () => clearTimeout(timer);
  }, [search, filter]);

  const handleBan = async () => {
    if (!banModal) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/admin/users/${banModal._id}/ban`, {
        reason: banReason
      });
      setUsers(prev => prev.map(u =>
        u._id === banModal._id ? { ...u, isBanned: !u.isBanned } : u
      ));
      toast.success(res.data.message);
      setBanModal(null);
      setBanReason('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/admin/users/${deleteModal._id}`);
      setUsers(prev => prev.filter(u => u._id !== deleteModal._id));
      toast.success(res.data.message);
      setDeleteModal(null);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMakeAdmin = async (userId, userName) => {
    if (!window.confirm(`Make ${userName} an admin? This cannot be undone easily.`)) return;
    try {
      const res = await api.put(`/admin/users/${userId}/make-admin`);
      setUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, isAdmin: true } : u
      ));
      toast.success(res.data.message);
    } catch (error) {
      toast.error('Failed to make admin');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-red-400" />
              User Management
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {pagination?.totalUsers || 0} total users
            </p>
          </div>
          <button onClick={() => loadUsers(currentPage)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </div>

          {/* Filter Buttons */}
          {['all', 'active', 'banned'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all"
              style={{
                background: filter === f ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.05)',
                border: filter === f ? '1px solid rgba(220,38,38,0.3)' : '1px solid rgba(255,255,255,0.1)',
                color: filter === f ? 'white' : 'rgba(255,255,255,0.5)'
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Users Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider"
            style={{
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.4)',
              borderBottom: '1px solid rgba(255,255,255,0.07)'
            }}>
            <div className="col-span-4">User</div>
            <div className="col-span-2">Roll No.</div>
            <div className="col-span-2">Uploads</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {users.map(user => (
                <div key={user._id}
                  className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-white/[0.02] transition-colors">

                  {/* User Info */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        background: user.isBanned
                          ? 'rgba(239,68,68,0.3)'
                          : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        {user.isBanned && (
                          <span className="text-xs px-1.5 py-0.5 rounded-md text-red-400 flex-shrink-0"
                            style={{ background: 'rgba(239,68,68,0.15)' }}>
                            Banned
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Roll No */}
                  <div className="col-span-2">
                    <span className="text-xs font-mono text-white/60">{user.rollNumber}</span>
                  </div>

                  {/* Uploads */}
                  <div className="col-span-2">
                    <p className="text-sm text-white/80">
                      {user.uploadStats?.count || 0}
                      <span className="text-xs text-white/30 ml-1">notes</span>
                    </p>
                    <p className="text-xs text-green-400/70">
                      {user.uploadStats?.downloads || 0} downloads
                    </p>
                  </div>

                  {/* Joined */}
                  <div className="col-span-2">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {formatDate(user.joinedAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center gap-1">
                    {/* Ban/Unban */}
                    <button
                      onClick={() => setBanModal(user)}
                      title={user.isBanned ? 'Unban user' : 'Ban user'}
                      className="p-1.5 rounded-lg transition-all duration-200"
                      style={{
                        background: user.isBanned ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: user.isBanned ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)',
                        color: user.isBanned ? '#34d399' : '#f87171'
                      }}>
                      {user.isBanned
                        ? <UserCheck className="w-3.5 h-3.5" />
                        : <UserX className="w-3.5 h-3.5" />
                      }
                    </button>

                    {/* Make Admin */}
                    {!user.isAdmin && (
                      <button
                        onClick={() => handleMakeAdmin(user._id, user.name)}
                        title="Make admin"
                        className="p-1.5 rounded-lg transition-all duration-200"
                        style={{
                          background: 'rgba(99,102,241,0.1)',
                          border: '1px solid rgba(99,102,241,0.2)',
                          color: '#818cf8'
                        }}>
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteModal(user)}
                      title="Delete user"
                      className="p-1.5 rounded-lg transition-all duration-200"
                      style={{
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.15)',
                        color: '#f87171'
                      }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadUsers(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg disabled:opacity-30 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => loadUsers(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="p-2 rounded-lg disabled:opacity-30 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Ban Modal ─────────────────────────────────────────── */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setBanModal(null)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div className="relative w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: '#0f0f20', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: banModal.isBanned ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                <AlertTriangle className={`w-5 h-5 ${banModal.isBanned ? 'text-green-400' : 'text-red-400'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {banModal.isBanned ? 'Unban User' : 'Ban User'}
                </h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {banModal.name}
                </p>
              </div>
            </div>

            {!banModal.isBanned && (
              <div>
                <label className="text-sm font-medium text-white/70 block mb-2">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Spam, inappropriate content..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setBanModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/60 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              <button onClick={handleBan} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{
                  background: banModal.isBanned
                    ? 'linear-gradient(135deg, #059669, #10b981)'
                    : 'linear-gradient(135deg, #dc2626, #b91c1c)'
                }}>
                {actionLoading ? 'Processing...' : banModal.isBanned ? 'Unban User' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Modal ──────────────────────────────────────── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteModal(null)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div className="relative w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: '#0f0f20', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.15)' }}>
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Delete User</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  This will delete {deleteModal.name} and ALL their notes permanently.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/60 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                {actionLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;