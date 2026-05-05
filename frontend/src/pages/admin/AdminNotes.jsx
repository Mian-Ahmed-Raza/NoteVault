import React, { useState, useEffect, useContext } from 'react';
import {
  FileText, Search, Trash2, Download,
  RefreshCw, ChevronLeft, ChevronRight,
  Filter, AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import { ToastContext } from '../../App';
import AdminLayout from './AdminLayout';

const AdminNotes = () => {
  const toast = useContext(ToastContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadNotes = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/notes', {
        params: { page, limit: 10, search, sort }
      });
      setNotes(res.data.notes);
      setPagination(res.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadNotes(1), 300);
    return () => clearTimeout(timer);
  }, [search, sort]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/notes/${deleteModal._id}`);
      setNotes(prev => prev.filter(n => n._id !== deleteModal._id));
      toast.success('Note deleted successfully');
      setDeleteModal(null);
    } catch (error) {
      toast.error('Failed to delete note');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const fileTypeColors = {
    pdf: '#ef4444', docx: '#3b82f6', doc: '#3b82f6',
    pptx: '#f97316', ppt: '#f97316', png: '#10b981',
    jpg: '#10b981', jpeg: '#10b981', txt: '#6b7280'
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-red-400" />
              Notes Management
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {pagination?.totalNotes || 0} total notes
            </p>
          </div>
          <button onClick={() => loadNotes(currentPage)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
            <option value="newest" className="bg-gray-900">Newest First</option>
            <option value="oldest" className="bg-gray-900">Oldest First</option>
            <option value="most-downloaded" className="bg-gray-900">Most Downloaded</option>
          </select>
        </div>

        {/* Notes Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider"
            style={{
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.4)',
              borderBottom: '1px solid rgba(255,255,255,0.07)'
            }}>
            <div className="col-span-4">Note</div>
            <div className="col-span-2">Uploader</div>
            <div className="col-span-2">Size / Type</div>
            <div className="col-span-2">Downloads</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-1">Action</div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No notes found</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {notes.map(note => (
                <div key={note._id}
                  className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-white/[0.02] transition-colors">

                  {/* Note Info */}
                  <div className="col-span-4 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{note.title}</p>
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {note.subject}
                    </p>
                  </div>

                  {/* Uploader */}
                  <div className="col-span-2 min-w-0">
                    <p className="text-sm text-white/70 truncate">{note.uploader?.name}</p>
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {note.uploader?.email}
                    </p>
                  </div>

                  {/* Size / Type */}
                  <div className="col-span-2">
                    <span className="text-xs font-bold uppercase px-2 py-1 rounded-md"
                      style={{
                        background: (fileTypeColors[note.fileType] || '#6b7280') + '20',
                        color: fileTypeColors[note.fileType] || '#6b7280',
                        border: `1px solid ${(fileTypeColors[note.fileType] || '#6b7280')}40`
                      }}>
                      {note.fileType}
                    </span>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {formatSize(note.fileSize)}
                    </p>
                  </div>

                  {/* Downloads */}
                  <div className="col-span-2">
                    <p className="text-sm text-green-400 flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {note.downloadsCount}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="col-span-1">
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {formatDate(note.createdAt)}
                    </p>
                  </div>

                  {/* Delete */}
                  <div className="col-span-1">
                    <button onClick={() => setDeleteModal(note)}
                      className="p-1.5 rounded-lg transition-all"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
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
            <div className="flex gap-2">
              <button onClick={() => loadNotes(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg disabled:opacity-30 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <button onClick={() => loadNotes(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="p-2 rounded-lg disabled:opacity-30 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
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
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Delete Note</h3>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  "{deleteModal.title}" will be permanently deleted.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/60"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
                {actionLoading ? 'Deleting...' : 'Delete Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminNotes;